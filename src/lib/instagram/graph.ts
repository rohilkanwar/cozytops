import type { InstagramProfile } from "../types";
import { config } from "../config";
import { ProviderUnavailableError } from "./errors";

// ---------------------------------------------------------------------------
// Instagram Graph API path.
//
// IMPORTANT OPERATIONAL NOTE: The official Graph API does NOT let you fetch an
// arbitrary public handle's media. It only returns data for accounts that have
// authorized YOUR app (via Facebook Login / Instagram Login), i.e. the visitor
// would connect their own account through OAuth. That is the ToS-compliant way
// to get a user's own photos with consent.
//
// This stub assumes you've already obtained a user access token for the visitor
// (e.g. stored in session after OAuth) and passed it through config. Wiring the
// OAuth handshake itself is an app-level concern left for the real integration.
// ---------------------------------------------------------------------------

interface GraphMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
}

export async function fetchViaGraph(handle: string): Promise<InstagramProfile> {
  const token = config.instagram.graphToken;
  if (!token) {
    throw new ProviderUnavailableError(
      "no Graph API user token; visitor must authorize via Instagram Login",
    );
  }

  // /me/media requires a user-authorized token; you cannot query other handles.
  const fields = "id,caption,media_type,media_url,timestamp,like_count";
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new ProviderUnavailableError(`Graph API responded ${res.status}`);
  }
  const data = (await res.json()) as { data?: GraphMedia[] };
  const media = data.data ?? [];

  return {
    handle,
    displayName: handle,
    bio: "",
    postCount: media.length,
    source: "graph",
    posts: media
      .filter((m) => m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM")
      .slice(0, 12)
      .map((m) => ({
        id: m.id,
        caption: m.caption ?? "",
        hashtags: extractHashtags(m.caption ?? ""),
        imageUrl: m.media_url,
        // The vision analyzer will describe imageUrl; empty alt until then.
        imageAlt: "",
        mediaType: "image" as const,
      })),
  };
}

function extractHashtags(caption: string): string[] {
  return Array.from(caption.matchAll(/#[\p{L}0-9_]+/gu)).map((m) => m[0]);
}
