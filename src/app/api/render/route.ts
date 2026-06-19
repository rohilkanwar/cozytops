import { NextResponse } from "next/server";
import { z } from "zod";
import { renderGarmentImage, imageProviderEnabled } from "@/lib/design/imagegen";
import type { DesignBrief, RenderResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One image per request keeps us comfortably under the serverless time limit.
export const maxDuration = 60;

const bodySchema = z.object({
  design: z.object({}).passthrough(),
  shot: z.enum(["product", "model"]),
  variant: z.number().int().min(0).max(4).default(0),
  vibe: z.string().default(""),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid render request." }, { status: 400 });
  }

  if (!imageProviderEnabled()) {
    const payload: RenderResponse = { unavailable: true };
    return NextResponse.json(payload);
  }

  try {
    const image = await renderGarmentImage(
      parsed.design as unknown as DesignBrief,
      parsed.shot,
      parsed.variant,
      parsed.vibe,
    );
    if (!image) {
      return NextResponse.json({ unavailable: true } satisfies RenderResponse);
    }
    return NextResponse.json({ image } satisfies RenderResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed.";
    console.error("[render] image generation failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
