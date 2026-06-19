import { NextResponse } from "next/server";
import { z } from "zod";
import { pollImageJob } from "@/lib/design/imagegen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A single quick status check.
export const maxDuration = 20;

const bodySchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid poll request." }, { status: 400 });
  }
  try {
    return NextResponse.json(await pollImageJob(parsed.id));
  } catch (err) {
    // Network/transient error — surface as 502 so the client retries.
    const message = err instanceof Error ? err.message : "Poll failed.";
    console.error("[render/poll]", message);
    return NextResponse.json({ status: "failed", error: message }, { status: 502 });
  }
}
