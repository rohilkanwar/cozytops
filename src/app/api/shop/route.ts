import { NextResponse } from "next/server";
import { z } from "zod";
import { generateShopRecommendations } from "@/lib/shop";
import type { StyleProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const swatch = z.object({ name: z.string(), hex: z.string() });

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
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid shop request." }, { status: 400 });
  }

  try {
    const payload = await generateShopRecommendations(
      parsed.style as StyleProfile,
      parsed.garment,
    );
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shop recommendations failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
