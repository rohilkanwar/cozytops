import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveInstagramProfile } from "@/lib/instagram";
import { analyzeStyle } from "@/lib/analysis/vision";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ handle: z.string().min(1).max(120) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Please provide an Instagram handle." },
      { status: 400 },
    );
  }

  try {
    const { profile, notice } = await resolveInstagramProfile(parsed.handle);
    const { style, engine } = await analyzeStyle(profile);
    const payload: AnalyzeResponse = { profile, style, engine, notice };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
