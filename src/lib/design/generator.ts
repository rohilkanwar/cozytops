import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { DesignBrief, GarmentType, StyleProfile } from "../types";
import { config } from "../config";
import { getAnthropic, extractJson } from "../anthropic";

const PATTERNS = ["solid", "stripes", "fairisle", "colorblock", "speckle", "gradient"] as const;

const GARMENT_NOUN: Record<GarmentType, string> = {
  sweater: "Knit",
  tee: "Tee",
  jacket: "Jacket",
};

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

function initials(style: StyleProfile, displayName?: string): string {
  const src = (displayName || style.handle || "").replace(/[._]+/g, " ").trim();
  const words = src.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return "CT";
}

function inferPattern(style: StyleProfile, garment: GarmentType): DesignBrief["pattern"] {
  // Dominant signals only (vibe + motifs + textures + affinities). style.aesthetics
  // is excluded since it can blend in a runner-up tag and muddy the read.
  const blob = [
    style.vibeName,
    ...style.motifs,
    ...style.textures,
    ...style.garmentAffinities,
  ]
    .join(" ")
    .toLowerCase();

  if (/colorblock|color-block|maximal|clash|gallery|vibrant/.test(blob)) return "colorblock";
  if (/stripe|breton|coastal|wave|nautical/.test(blob)) return "stripes";
  if (/fair ?isle|cottage|wildflower|embroider|heirloom|floral/.test(blob))
    return garment === "sweater" ? "fairisle" : "speckle";
  if (/monochrome|techwear|utility|greyscale|all ?black|negative space/.test(blob))
    return garment === "sweater" ? "colorblock" : "solid";
  if (/denim|vintage|thrift|rust|worn|heather|speckle/.test(blob)) return "speckle";
  if (/knit/.test(blob)) return garment === "sweater" ? "fairisle" : "speckle";
  return garment === "tee" ? "solid" : "stripes";
}

/** Deterministic design brief — always available, no API key required. */
export function designHeuristic(
  style: StyleProfile,
  garment: GarmentType,
  displayName?: string,
): DesignBrief {
  const palette = style.palette.length
    ? style.palette
    : [{ name: "Clay", hex: "#B7755A" }];
  const primaryColor = hexClean(palette[0].hex, "#B7755A");
  const secondaryColor = hexClean(palette[1]?.hex ?? palette[0].hex, "#E7DAC4");
  const accentColor = hexClean(
    palette[palette.length - 1]?.hex ?? palette[0].hex,
    "#2C2A28",
  );

  const noun = GARMENT_NOUN[garment];
  const title = `The ${style.vibeName} ${noun}`;
  const trait = style.personaTraits[0] ?? "easygoing";
  const story = `Cut just for @${style.handle}: ${style.signatureMotif}, carried in your ${palette[0].name.toLowerCase()} and ${(palette[palette.length - 1]?.name ?? "ink").toLowerCase()}. A ${trait} piece that wears like it has always been yours.`;

  return {
    garment,
    title,
    story,
    palette: palette.slice(0, 5),
    primaryColor,
    secondaryColor,
    accentColor,
    pattern: inferPattern(style, garment),
    motifs: style.motifs.slice(0, 3),
    monogram: initials(style, displayName),
    placementNotes: `${style.signatureMotif} interpreted across the body; a small monogram patch at the left chest.`,
    materials: GARMENT_MATERIAL[garment],
    careVibe: "Soft enough for slow Sundays, sturdy enough to make it a signature.",
  };
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

async function designWithClaude(
  client: Anthropic,
  style: StyleProfile,
  garment: GarmentType,
  displayName?: string,
): Promise<DesignBrief> {
  const resp = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Design a custom ${garment} for @${style.handle}${displayName ? ` (${displayName})` : ""}.

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
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const raw = extractJson<unknown>(text);
  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Claude design failed validation");

  const d = parsed.data;
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
    monogram: d.monogram,
    placementNotes: d.placementNotes || `${style.signatureMotif} across the body.`,
    materials: d.materials || GARMENT_MATERIAL[garment],
    careVibe: d.careVibe || "Made to become a signature.",
  };
}

/** Orchestrates design generation: Claude when available, heuristic otherwise. */
export async function generateDesign(
  style: StyleProfile,
  garment: GarmentType,
  displayName?: string,
): Promise<{ design: DesignBrief; engine: "claude" | "heuristic" }> {
  const client = getAnthropic();
  if (client) {
    try {
      const design = await designWithClaude(client, style, garment, displayName);
      return { design, engine: "claude" };
    } catch {
      // fall through
    }
  }
  return { design: designHeuristic(style, garment, displayName), engine: "heuristic" };
}
