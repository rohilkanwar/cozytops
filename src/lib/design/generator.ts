import { z } from "zod";
import type { DesignBrief, GarmentType, StyleProfile } from "../types";
import { openaiJson } from "../openai";

// Design briefs are always model-authored from the real style profile. There
// is no heuristic fallback: if generation fails, we throw and the API
// surfaces the error loudly.

const PATTERNS = ["solid", "stripes", "fairisle", "colorblock", "speckle", "gradient"] as const;

const GARMENT_MATERIAL: Record<GarmentType, string> = {
  sweater: "Mid-weight combed-cotton knit, 320gsm, with ribbed collar and cuffs",
  tee: "Heavyweight garment-dyed cotton, 240gsm, with a relaxed boxy fit",
  jacket: "Cotton-twill chore jacket with corozo buttons and patch pockets",
};

function hexClean(h: string, fallback: string): string {
  const m = (h || "").match(/#?[0-9a-fA-F]{6}/);
  if (!m) return fallback;
  const v = m[0];
  return v.startsWith("#") ? v : `#${v}`;
}

const briefSchema = z.object({
  title: z.string().min(1),
  story: z.string().min(1),
  palette: z
    .array(
      z.object({
        name: z.string().default("Tone"),
        hex: z
          .string()
          .regex(/^#?[0-9a-fA-F]{6}$/)
          .transform((s) => (s.startsWith("#") ? s : `#${s}`))
          .catch("#B7755A"),
      }),
    )
    .min(1)
    .max(5),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  pattern: z.enum(PATTERNS).catch("stripes"),
  motifs: z.array(z.string()).default([]),
  monogram: z.string().max(3).optional().default(""),
  placementNotes: z.string().default(""),
  materials: z.string().default(""),
  careVibe: z.string().default(""),
});

const optionsSchema = z.object({ options: z.array(briefSchema).min(3).max(4) });

const SYSTEM_PROMPT = `You are Cozy Tops' garment designer. Given a customer's style profile and a chosen garment, you design FOUR distinct, one-of-one takes on that garment — each of which must feel unmistakably *theirs*, but through a different design direction.

Make the four options genuinely different from each other: vary the pattern, the palette emphasis, the mood (e.g. quiet/minimal vs bold/expressive), and where the personification lives.

Personalization comes through the design itself — a signature motif, an embroidered detail, a color story, a construction choice drawn directly from who they are. Do NOT default to initials: AT MOST ONE of the four options may use a subtle 1-3 character monogram; the other options must have "monogram": "".

Stay manufacturable for print-on-demand or knit: pick from these construction patterns only — solid, stripes, fairisle, colorblock, speckle, gradient. Name each piece. Tell each piece's short story in warm second person.

Respond with ONLY a JSON object (no prose, no code fence):
{
  "options": [
    {
      "title": string,            // the named piece
      "story": string,            // 1-2 sentences, warm, second person, the personification
      "palette": [{"name": string, "hex": "#RRGGBB"}],  // 2-5 colors
      "primaryColor": "#RRGGBB",  // dominant garment color
      "secondaryColor": "#RRGGBB",
      "accentColor": "#RRGGBB",   // for ribbing/details
      "pattern": "solid|stripes|fairisle|colorblock|speckle|gradient",
      "motifs": string[],
      "monogram": string,         // "" for most options; 1-3 chars on at most ONE
      "placementNotes": string,
      "materials": string,
      "careVibe": string
    },
    ... exactly 4 options
  ]
}`;

/** Authors 4 distinct design options with the model. Throws (loudly) when it can't. */
export async function generateDesignOptions(
  style: StyleProfile,
  garment: GarmentType,
  displayName?: string,
): Promise<{ options: DesignBrief[]; engine: "openai" }> {
  const raw = await openaiJson({
    instructions: SYSTEM_PROMPT,
    content: [
      {
        type: "input_text",
        text: `Design four distinct custom ${garment} options for @${style.handle}${displayName ? ` (${displayName})` : ""}, as a JSON object.

STYLE PROFILE
Vibe: ${style.vibeName}
Summary: ${style.summary}
Aesthetics: ${style.aesthetics.join(", ")}
Garment affinities: ${style.garmentAffinities.join(", ")}
Motifs: ${style.motifs.join(", ")}
Textures: ${style.textures.join(", ")}
Persona traits: ${style.personaTraits.join(", ")}
Signature element to personify: ${style.signatureMotif}
Palette: ${style.palette.map((p) => `${p.name} ${p.hex}`).join(", ")}

Design the four ${garment} options. Make each personification unmistakable — and make the four directions genuinely different.`,
      },
    ],
    maxOutputTokens: 4000,
  });

  const parsed = optionsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The design options failed validation — please try again.");
  }

  // Enforce the no-initials-by-default rule even if the model over-monograms:
  // keep a monogram on at most the first option that used one.
  let monogramSeen = false;
  const options: DesignBrief[] = parsed.data.options.map((d) => {
    const keepMonogram = Boolean(d.monogram) && !monogramSeen;
    if (d.monogram) monogramSeen = true;
    return {
      garment,
      title: d.title,
      story: d.story,
      palette: d.palette,
      primaryColor: hexClean(d.primaryColor, d.palette[0].hex),
      secondaryColor: hexClean(d.secondaryColor, d.palette[1]?.hex ?? d.palette[0].hex),
      accentColor: hexClean(d.accentColor, d.palette[d.palette.length - 1].hex),
      pattern: d.pattern,
      motifs: d.motifs.length ? d.motifs : style.motifs.slice(0, 3),
      monogram: keepMonogram ? d.monogram : "",
      placementNotes: d.placementNotes || `${style.signatureMotif} across the body.`,
      materials: d.materials || GARMENT_MATERIAL[garment],
      careVibe: d.careVibe || "Made to become a signature.",
    };
  });

  return { options, engine: "openai" };
}
