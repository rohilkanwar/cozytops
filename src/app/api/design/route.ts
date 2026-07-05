import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDesignOptions } from "@/lib/design/generator";
import type { DesignResponse, StyleProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const swatch = z.object({ name: z.string(), hex: z.string() });

// Permissive validation of the style profile echoed back from the client,
// plus the chosen garment.
const styleSchema = z.object({
  handle: z.string().min(1),
  vibeName: z.string().min(1),
  summary: z.string(),
  palette: z.array(swatch).min(1),
  aesthetics: z.array(z.string()).default([]),
  garmentAffinities: z.array(z.string()).default([]),
  motifs: z.array(z.string()).default([]),
  textures: z.array(z.string()).default([]),
  personaTraits: z.array(z.string()).default([]),
  signatureMotif: z.string().min(1),
  confidence: z.number().default(0.7),
  evidence: z.array(z.object({ postId: z.string(), observation: z.string() })).default([]),
});

const bodySchema = z.object({
  style: styleSchema,
  garment: z.enum(["sweater", "tee", "jacket"]),
  displayName: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid design request." }, { status: 400 });
  }

  try {
    const { options, engine } = await generateDesignOptions(
      parsed.style as StyleProfile,
      parsed.garment,
      parsed.displayName,
    );
    const payload: DesignResponse = { options, engine };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Design failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
