import type { DesignBrief, GarmentType, ShotKind } from "../types";
import { config } from "../config";
import {
  startImageJob,
  pollImageJob,
  type ImageSize,
  type PollResult,
} from "./providers/openai-image";

// ---------------------------------------------------------------------------
// Photorealistic garment imagery. Turns a DesignBrief into a rich prompt and
// asks an image model for a catalogue-style product shot or an on-model
// editorial shot. Falls back to null (→ SVG) when no provider is configured.
// ---------------------------------------------------------------------------

const GARMENT_WORD: Record<GarmentType, string> = {
  sweater: "relaxed-fit crewneck knit sweater",
  tee: "relaxed boxy short-sleeve cotton t-shirt",
  jacket: "cotton-twill chore jacket (overshirt) with a button front and patch pockets",
};

const FABRIC_WORD: Record<GarmentType, string> = {
  sweater: "soft mid-weight knit",
  tee: "soft heavyweight cotton jersey",
  jacket: "structured cotton twill",
};

const MODELS = [
  "a stylish woman in her late twenties with natural makeup, relaxed confident posture",
  "a stylish man in his early thirties, easy confident posture",
  "a person in their late twenties with an effortless, editorial presence",
];

function pName(brief: DesignBrief, i: number, fallback: string): string {
  return brief.palette[i]?.name?.toLowerCase() ?? fallback;
}

function patternPhrase(brief: DesignBrief): string {
  const p = pName(brief, 0, "warm neutral");
  const s = pName(brief, 1, p);
  const a = brief.palette.length
    ? pName(brief, brief.palette.length - 1, "contrast")
    : "contrast";
  switch (brief.pattern) {
    case "stripes":
      return `with horizontal ${p} and ${s} Breton stripes`;
    case "fairisle":
      return `in ${p} with a Fair-Isle patterned yoke across the chest in ${s} and ${a}`;
    case "colorblock":
      return `color-blocked in ${p} and ${s}`;
    case "speckle":
      return `in a heathered ${p} marl`;
    case "gradient":
      return `in a soft ${p}-to-${s} gradient`;
    case "solid":
    default:
      return `in a solid ${p}`;
  }
}

function sceneFor(vibe: string, brief: DesignBrief): string {
  const blob = `${vibe} ${brief.motifs.join(" ")} ${brief.title}`.toLowerCase();
  if (/coastal|heirloom|salt|sea|breton|tide/.test(blob))
    return "in a sunlit coastal setting — pale sand, weathered driftwood, soft sea-glass tones, breezy natural light";
  if (/cottage|marmalade|garden|floral|wildflower/.test(blob))
    return "in a warm cottage garden at golden hour, wildflowers and soft greenery behind";
  if (/monochrome|utility|carbon|concrete|tech|brutal/.test(blob))
    return "in a minimalist urban setting — raw concrete and clean lines under cool, even light";
  if (/americana|denim|worn|vintage|rust|thrift/.test(blob))
    return "in a lived-in vintage setting — warm brick and worn wood, soft nostalgic afternoon light";
  if (/gallery|maximal|tangerine|colou?r|bold/.test(blob))
    return "in a bright contemporary art gallery with a bold colorful backdrop and clean even light";
  return "in a clean, warm-toned editorial studio setting with soft daylight";
}

function garmentSpec(brief: DesignBrief): string {
  const accent = brief.palette.length
    ? pName(brief, brief.palette.length - 1, "tonal")
    : "tonal";
  const motif = brief.motifs[0];
  const emblem = motif
    ? `On the left chest, a small tasteful embroidered emblem inspired by ${motif}${
        brief.monogram ? `, with the subtle monogram "${brief.monogram}"` : ""
      }.`
    : brief.monogram
      ? `A small embroidered "${brief.monogram}" monogram on the left chest.`
      : "";
  return `${GARMENT_WORD[brief.garment]} ${patternPhrase(brief)}, with ${accent} ribbed trims. ${emblem}`.trim();
}

export function buildImagePrompt(
  brief: DesignBrief,
  shot: ShotKind,
  variant: number,
  vibe: string,
): string {
  const spec = garmentSpec(brief);
  if (shot === "product") {
    return [
      "Ultra-realistic professional e-commerce product photograph for a premium heritage fashion house.",
      `A single ${spec}`,
      "Presented on an invisible ghost-mannequin, perfectly centred front view, against a clean warm off-white seamless studio backdrop.",
      `Soft, even, diffused studio softbox lighting; photographed on a medium-format camera with a 100mm lens; true-to-life ${FABRIC_WORD[brief.garment]} texture with visible knit/weave detail and a natural fabric drape; tack-sharp focus; colour-accurate; high-resolution luxury catalogue look.`,
      "Photorealistic. No visible mannequin, no human, no text, no logo, no watermark.",
    ].join(" ");
  }
  const model = MODELS[variant % MODELS.length];
  return [
    "Ultra-realistic editorial fashion campaign photograph for a premium heritage label, in the aspirational tone of timeless American heritage luxury.",
    `${model}, wearing a ${spec}`,
    sceneFor(vibe, brief) + ".",
    "Soft natural directional light, warm filmic colour grade reminiscent of Kodak Portra 400, fine film grain, three-quarter-body framing, photographed on a medium-format camera with an 80mm lens at a shallow depth of field.",
    "Refined, relaxed styling; natural skin texture; lifelike fabric detail; photorealistic. The garment is the hero of the shot. No text, no logo, no watermark.",
  ].join(" ");
}

/** Alt text for a generated shot. */
export function altFor(brief: DesignBrief, shot: ShotKind): string {
  return shot === "product"
    ? `${brief.title} — product photo`
    : `${brief.title} worn by a model`;
}

/**
 * Starts a background image job for one shot; returns the job id.
 * The "preview" tier renders cheaper thumbnails for option cards; "full" is
 * the catalogue-quality set for the selected design.
 */
export async function startGarmentJob(
  brief: DesignBrief,
  shot: ShotKind,
  variant: number,
  vibe: string,
  tier: "preview" | "full" = "full",
): Promise<string> {
  const prompt = buildImagePrompt(brief, shot, variant, vibe);
  const size: ImageSize = shot === "model" ? "1024x1792" : "1024x1024";
  const quality = tier === "preview" ? config.image.previewQuality : config.image.quality;
  return startImageJob(prompt, size, quality);
}

export { pollImageJob };
export type { PollResult };
