import { NextResponse } from "next/server";
import { z } from "zod";
import { startGarmentJob, altFor, imageProviderEnabled } from "@/lib/design/imagegen";
import type { DesignBrief } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Only starts the job (returns an id in ~1s) — no long wait here.
export const maxDuration = 30;

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
    return NextResponse.json({ unavailable: true });
  }

  const design = parsed.design as unknown as DesignBrief;
  try {
    const jobId = await startGarmentJob(design, parsed.shot, parsed.variant, parsed.vibe);
    return NextResponse.json({
      jobId,
      kind: parsed.shot,
      alt: altFor(design, parsed.shot),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start image job.";
    console.error("[render/start]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
