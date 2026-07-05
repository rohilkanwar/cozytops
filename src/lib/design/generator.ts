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
  monogram: z.string().min(1).max(3),
  placementNotes: z.string().default(""),
  materials: z.string().default(""),
  careVibe: z.string().default(""),
});

const SYSTEM_PROMPT = `You are Cozy Tops' garment designer. Given a customer's style profile and a chosen garment, you design a single, one-of-one piece that feels unmistakably *theirs*.

Crucially, include a "personification" element: a signature detail (a motif, monogram, embroidered phrase, or color story) drawn directly from who they are. Name the piece. Tell its short story in warm second person.

Stay manufacturable for print-on-demand or knit: pick from these construction patterns only — solid, stripes, fairisle, colorblock, speckle, gradient.

Respond with ONLY a JSON object (no prose, no code fence):
{
  "title": string,            // the named piece
  "story": string,            // 1-2 sentences, warm, second person, the personification
  "palette": [{"name": string, "hex": "#RRGGBB"}],  // 2-5 colors
  "primaryColor": "#RRGGBB",  // dominant garment color
  "secondaryColor": "#RRGGBB",
  "accentColor": "#RRGGBB",   // for ribbing/monogram/details
  "pattern": "solid|stripes|fairisle|colorblock|speckle|gradient",
  "motifs": string[],
  "monogram": string,         // 1-3 chars for a chest patch
  "placementNotes": string,
  "materials": string,
  "careVibe": string
}`;

/** Authors the design brief with the model. Throws (loudly) when it can't. */
export async function generateDesign(
  style: StyleProfile,
  garment: GarmentType,
  displayName?: string,
): Promise<{ design: DesignBrief; engine: "openai" }> {
  const raw = await openaiJson({
    instructions: SYSTEM_PROMPT,
    content: [
      {
        type: "input_text",
        text: `Design a custom ${garment} for @${style.handle}${displayName ? ` (${displayName})` : ""}.

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

Design the ${garment}. Make the personification unmistakable.`,
      },
    ],
    maxOutputTokens: 1200,
  });

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The design brief failed validation — please try again.");
  }

  const d = parsed.data;
  return {
    engine: "openai",
    design: {
      garment,
      title: d.title,
      story: d.story,
      palette: d.palette,
      primaryColor: hexClean(d.primaryColor, d.palette[0].hex),
      secondaryColor: hexClean(d.secondaryColor, d.palette[1]?.hex ?? d.palette[0].hex),
      accentColor: hexClean(d.accentColor, d.palette[d.palette.length - 1].hex),
      pattern: d.pattern,
      motifs: d.motifs.length ? d.motifs : style.motifs.slice(0, 3),
      monogram: d.monogram,
      placementNotes: d.placementNotes || `${style.signatureMotif} across the body.`,
      materials: d.materials || GARMENT_MATERIAL[garment],
      careVibe: d.careVibe || "Made to become a signature.",
    },
  };
}
