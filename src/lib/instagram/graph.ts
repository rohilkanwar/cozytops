import type { InstagramProfile, InstagramPost } from "../types";
import { config } from "../config";
import { ProviderUnavailableError } from "./errors";

// ---------------------------------------------------------------------------
// Instagram Graph API path — the OAuth self-connect flow. Reads the media of
// the user who authorized our app (the /me node), which works for their own
// account whether it is public or private. It CANNOT read anyone else's
// account. The token is obtained per-session via oauth.ts and passed in here;
// nothing is stored server-side.
// ---------------------------------------------------------------------------

interface GraphMe {
  username?: string;
  name?: string;
  account_type?: string;
  media_count?: number;
}

interface GraphMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
  like_count?: number;
}

/** Reads the connected user's own profile + recent media with their token. */
export async function fetchViaGraph(token: string): Promise<InstagramProfile> {
  if (!token) {
    throw new ProviderUnavailableError("no Instagram access token for this session");
  }
  const base = config.instagram.oauth.graphBase;

  const meRes = await fetch(
    `${base}/me?fields=username,name,account_type,media_count&access_token=${encodeURIComponent(token)}`,
  );
  if (!meRes.ok) {
    throw new ProviderUnavailableError(await graphError(meRes));
  }
  const me = (await meRes.json()) as GraphMe;
  const handle = (me.username || "you").toLowerCase();

  const fields = "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count";
  const mediaRes = await fetch(
    `${base}/me/media?fields=${fields}&limit=12&access_token=${encodeURIComponent(token)}`,
  );
  if (!mediaRes.ok) {
    throw new ProviderUnavailableError(await graphError(mediaRes));
  }
  const data = (await mediaRes.json()) as { data?: GraphMedia[] };
  const media = data.data ?? [];

  const posts: InstagramPost[] = media
    .filter((m) => m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM")
    .slice(0, 12)
    .map((m) => ({
      id: m.id,
      caption: m.caption ?? "",
      hashtags: extractHashtags(m.caption ?? ""),
      imageUrl: m.media_url ?? m.thumbnail_url,
      // The vision analyzer describes imageUrl; empty alt until then.
      imageAlt: "",
      likeCount: m.like_count,
      takenAt: m.timestamp,
      mediaType: "image" as const,
    }));

  if (posts.length === 0) {
    throw new ProviderUnavailableError(
      "your connected account has no readable image posts to analyze",
    );
  }

  return {
    handle,
    displayName: me.name || me.username || "You",
    bio: "",
    postCount: me.media_count ?? posts.length,
    posts,
    source: "graph",
  };
}

async function graphError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    if (parsed.error?.message) return `Instagram Graph ${res.status}: ${parsed.error.message}`;
  } catch {
    /* fall through */
  }
  return `Instagram Graph API responded ${res.status}`;
}

function extractHashtags(caption: string): string[] {
  return Array.from(caption.matchAll(/#[\p{L}0-9_]+/gu)).map((m) => m[0]);
}
