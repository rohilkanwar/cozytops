import type { InstagramProfile, InstagramPost } from "../types";
import { config } from "../config";
import { ProviderUnavailableError } from "./errors";

// ---------------------------------------------------------------------------
// Licensed third-party data path (e.g. an Apify Instagram actor).
//
// Using a reputable, compliant data vendor is the pragmatic way to read PUBLIC
// posts for a handle the visitor provides. Keep this behind explicit user
// consent + clear disclosure, and respect the vendor's + Instagram's terms.
//
// This calls Apify's run-sync endpoint and maps the result into our types.
// It only executes when APIFY_TOKEN is set; otherwise it cleanly defers to demo.
// ---------------------------------------------------------------------------

interface ApifyItem {
  id?: string;
  shortCode?: string;
  caption?: string;
  hashtags?: string[];
  displayUrl?: string;
  alt?: string;
  likesCount?: number;
  timestamp?: string;
  type?: string;
}

export async function fetchViaApify(handle: string): Promise<InstagramProfile> {
  const token = config.instagram.apifyToken;
  if (!token) {
    throw new ProviderUnavailableError("no APIFY_TOKEN configured");
  }

  const endpoint = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/${handle}/`],
      resultsType: "posts",
      resultsLimit: 12,
    }),
  });

  if (!res.ok) {
    throw new ProviderUnavailableError(`Apify responded ${res.status}`);
  }

  const items = (await res.json()) as ApifyItem[];
  if (!Array.isArray(items) || items.length === 0) {
    throw new ProviderUnavailableError("no public posts returned");
  }

  const posts: InstagramPost[] = items
    .filter((it) => it.type !== "Video")
    .slice(0, 12)
    .map((it, i) => ({
      id: it.id || it.shortCode || `${handle}-${i}`,
      caption: it.caption ?? "",
      hashtags: it.hashtags ?? extractHashtags(it.caption ?? ""),
      imageUrl: it.displayUrl,
      imageAlt: it.alt ?? "",
      likeCount: it.likesCount,
      takenAt: it.timestamp,
      mediaType: "image",
    }));

  return {
    handle,
    displayName: handle,
    bio: "",
    postCount: items.length,
    posts,
    source: "apify",
  };
}

function extractHashtags(caption: string): string[] {
  return Array.from(caption.matchAll(/#[\p{L}0-9_]+/gu)).map((m) => m[0]);
}
