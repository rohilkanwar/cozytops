import type { InstagramProfile } from "../types";
import { config } from "../config";
import { ARCHETYPES } from "./personas";
import { fetchViaGraph } from "./graph";
import { fetchViaApify } from "./apify";

export { ProviderUnavailableError } from "./errors";

/**
 * Normalizes any of: "https://instagram.com/foo/", "@foo", "foo?hl=en", "FOO"
 * down to a bare lowercase handle ("foo").
 */
export function normalizeHandle(input: string): string {
  let h = (input || "").trim();
  // Pull the handle out of a full URL if one was pasted.
  const urlMatch = h.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) h = urlMatch[1];
  h = h.replace(/^@/, "");
  h = h.split(/[?#/]/)[0];
  return h.toLowerCase().replace(/[^a-z0-9._]/g, "");
}

/** Stable, deterministic 32-bit hash so a handle always maps to one persona. */
function hashHandle(handle: string): number {
  let h = 2166136261;
  for (let i = 0; i < handle.length; i++) {
    h ^= handle.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function titleCaseFromHandle(handle: string): string {
  const words = handle
    .replace(/[._]+/g, " ")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return handle;
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Showcase handles map to a specific archetype for a coherent demo; everything
// else is assigned deterministically by hash.
const NAMED_HANDLES: Record<string, string> = {
  thesaltyloom: "coastal-loom",
  "rust.and.denim": "thrift-denim",
  "marmalade.mornings": "cottage-knit",
  "concrete.carbon": "mono-tech",
  "tangerine.dream": "gallery-color",
};

/** Builds a believable demo profile for any handle from a curated archetype. */
export function buildDemoProfile(handle: string): InstagramProfile {
  const namedKey = NAMED_HANDLES[handle];
  const archetype =
    (namedKey && ARCHETYPES.find((a) => a.key === namedKey)) ||
    ARCHETYPES[hashHandle(handle) % ARCHETYPES.length];
  const seed = hashHandle(handle);

  const posts = archetype.posts.map((p, i) => ({
    ...p,
    id: `${handle}-${i}`,
  }));

  return {
    handle,
    displayName: titleCaseFromHandle(handle) || archetype.displayName,
    bio: archetype.bio,
    postCount: 100 + (seed % 900),
    posts,
    source: "demo",
  };
}

/**
 * Resolves a handle to a profile using the configured provider. No silent
 * fallbacks: if a live source is configured and fails, the error propagates;
 * if nothing is configured, we refuse rather than serve sample data as real.
 * Demo personas exist only behind an explicit INSTAGRAM_PROVIDER=demo, and are
 * always labeled as such via the notice.
 */
export async function resolveInstagramProfile(
  rawHandle: string,
): Promise<{ profile: InstagramProfile; notice?: string }> {
  const handle = normalizeHandle(rawHandle);
  if (!handle) {
    throw new Error("Please enter a valid Instagram handle.");
  }

  const provider = config.instagram.provider;

  if (provider === "demo") {
    return {
      profile: buildDemoProfile(handle),
      notice: `Demo mode is explicitly enabled (INSTAGRAM_PROVIDER=demo): this is a sample persona, NOT a live read of @${handle}.`,
    };
  }

  if (provider === "graph" || provider === "apify") {
    try {
      const profile =
        provider === "graph"
          ? await fetchViaGraph(handle)
          : await fetchViaApify(handle);
      return { profile };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error";
      throw new Error(
        `Couldn't fetch @${handle} from Instagram via ${provider}: ${reason}`,
      );
    }
  }

  throw new Error(
    `No Instagram source is configured, so @${handle} cannot actually be analyzed. Set INSTAGRAM_PROVIDER=apify with an APIFY_TOKEN (licensed public-data vendor), or INSTAGRAM_PROVIDER=demo for clearly-labeled sample personas.`,
  );
}
