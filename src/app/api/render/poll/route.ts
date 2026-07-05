import { NextResponse } from "next/server";
import { z } from "zod";
import { pollImageJob, type PollResult } from "@/lib/design/imagegen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A batch of quick status checks (one OpenAI GET per id, in parallel).
export const maxDuration = 20;

const bodySchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(16) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid poll request." }, { status: 400 });
  }

  const entries = await Promise.all(
    parsed.ids.map(async (id): Promise<[string, PollResult]> => {
      try {
        return [id, await pollImageJob(id)];
      } catch (err) {
        // Transient network error for this id — report pending so the client
        // retries on its next tick; terminal failures come back as "failed"
        // from pollImageJob itself. The poll loop's attempt cap bounds this.
        const message = err instanceof Error ? err.message : "poll failed";
        console.error("[render/poll]", id, message);
        return [id, { status: "pending" }];
      }
    }),
  );

  return NextResponse.json({ results: Object.fromEntries(entries) });
}
