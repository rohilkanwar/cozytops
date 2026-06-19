import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { InstagramProfile, StyleProfile } from "../types";
import { config } from "../config";
import { getAnthropic, extractJson } from "../anthropic";
import { analyzeHeuristic } from "./heuristic";
import { AESTHETICS } from "./lexicon";

export type AnalysisEngine = "claude-vision" | "claude-text" | "heuristic";

const swatchSchema = z.object({
  name: z.string().default("Tone"),
  hex: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .transform((s) => (s.startsWith("#") ? s : `#${s}`))
    .catch("#9C8C76"),
});

const styleSchema = z.object({
  vibeName: z.string().min(1),
  summary: z.string().min(1),
  palette: z.array(swatchSchema).min(1).max(6),
  aesthetics: z.array(z.string()).default([]),
  garmentAffinities: z.array(z.string()).default([]),
  motifs: z.array(z.string()).default([]),
  textures: z.array(z.string()).default([]),
  personaTraits: z.array(z.string()).default([]),
  signatureMotif: z.string().min(1),
  confidence: z.number().min(0).max(1).catch(0.7),
  evidence: z
    .array(z.object({ postId: z.string(), observation: z.string() }))
    .default([]),
});

/** Best-effort: fetch a few post images and encode them for true vision input. */
async function buildImageBlocks(
  profile: InstagramProfile,
): Promise<Anthropic.ImageBlockParam[]> {
  const withUrls = profile.posts.filter((p) => p.imageUrl).slice(0, 6);
  const blocks: Anthropic.ImageBlockParam[] = [];

  await Promise.all(
    withUrls.map(async (p) => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(p.imageUrl as string, { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) return;
        const type = res.headers.get("content-type") || "image/jpeg";
        if (!/^image\/(jpeg|png|webp|gif)/.test(type)) return;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > 4_500_000) return; // keep payloads sane
        blocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: type.split(";")[0] as
              | "image/jpeg"
              | "image/png"
              | "image/webp"
              | "image/gif",
            data: buf.toString("base64"),
          },
        });
      } catch {
        /* skip unreachable images */
      }
    }),
  );
  return blocks;
}

function buildPostDigest(profile: InstagramProfile): string {
  return profile.posts
    .map((p, i) => {
      const parts = [`POST ${i + 1} (id: ${p.id})`];
      if (p.caption) parts.push(`  caption: ${p.caption}`);
      if (p.hashtags.length) parts.push(`  hashtags: ${p.hashtags.join(" ")}`);
      if (p.imageAlt) parts.push(`  image shows: ${p.imageAlt}`);
      return parts.join("\n");
    })
    .join("\n\n");
}

const SYSTEM_PROMPT = `You are Cozy Tops' lead stylist and visual analyst. You study a person's public Instagram posts — their captions, hashtags, and imagery — and distill a precise, flattering, *specific* read of their personal clothing style.

You reason multimodally: when images are provided, analyze garments, silhouettes, color palettes, textures, and how they present themselves. Always ground conclusions in the actual evidence.

Be specific and evocative, never generic. Coin a memorable two-or-three-word "vibe name." Identify the single most "them" signature element worth immortalizing on a garment.

Respond with ONLY a JSON object (no prose, no code fence) matching exactly:
{
  "vibeName": string,
  "summary": string,            // 2-3 sentences, second-person warm tone
  "palette": [{"name": string, "hex": "#RRGGBB"}],  // 3-6 colors drawn from their world
  "aesthetics": string[],       // 3-5 aesthetic tags
  "garmentAffinities": string[],// specific garments they gravitate to
  "motifs": string[],           // recurring visual/thematic motifs
  "textures": string[],         // material/texture leanings
  "personaTraits": string[],    // personality read from how they present
  "signatureMotif": string,     // the ONE element to personify on the garment
  "confidence": number,         // 0..1
  "evidence": [{"postId": string, "observation": string}]  // tie reads to posts
}`;

async function analyzeWithClaude(
  client: Anthropic,
  profile: InstagramProfile,
): Promise<{ style: StyleProfile; engine: AnalysisEngine }> {
  const images = await buildImageBlocks(profile);
  const engine: AnalysisEngine = images.length > 0 ? "claude-vision" : "claude-text";

  const vibeMenu = AESTHETICS.map((a) => a.vibeName).join(", ");

  const content: Anthropic.ContentBlockParam[] = [
    {
      type: "text",
      text: `Analyze this person's style and return the JSON profile.

Handle: @${profile.handle}
Display name: ${profile.displayName}
Bio: ${profile.bio || "(none)"}

For inspiration only (you are NOT limited to these), some example vibe directions: ${vibeMenu}.

${images.length > 0 ? `${images.length} of their photos are attached below. Analyze them directly.\n\n` : ""}Here is their recent activity:

${buildPostDigest(profile)}`,
    },
    ...images,
  ];

  const resp = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const raw = extractJson<unknown>(text);
  const parsed = styleSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Claude response failed validation");
  }

  return {
    style: { handle: profile.handle, ...parsed.data },
    engine,
  };
}

/**
 * Orchestrates style analysis: Claude when configured, with a guaranteed
 * heuristic fallback so the endpoint never hard-fails.
 */
export async function analyzeStyle(
  profile: InstagramProfile,
): Promise<{ style: StyleProfile; engine: AnalysisEngine }> {
  const client = getAnthropic();
  if (client) {
    try {
      return await analyzeWithClaude(client, profile);
    } catch {
      // fall through to heuristic
    }
  }
  return { style: analyzeHeuristic(profile), engine: "heuristic" };
}
