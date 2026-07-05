import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { resolveInstagramProfile, resolveConnectedProfile } from "@/lib/instagram";
import { analyzeStyle } from "@/lib/analysis/vision";
import { OAUTH_TOKEN_COOKIE } from "@/lib/instagram/oauth";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.union([
  z.object({ handle: z.string().min(1).max(120) }),
  z.object({ connected: z.literal(true) }),
]);

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Provide an Instagram handle, or connect your account." },
      { status: 400 },
    );
  }

  try {
    let resolved;
    if ("connected" in parsed) {
      const token = cookies().get(OAUTH_TOKEN_COOKIE)?.value;
      if (!token) {
        return NextResponse.json(
          { error: "Your Instagram session has expired — please connect again." },
          { status: 401 },
        );
      }
      resolved = await resolveConnectedProfile(token);
    } else {
      resolved = await resolveInstagramProfile(parsed.handle);
    }

    const { style, engine } = await analyzeStyle(resolved.profile);
    const payload: AnalyzeResponse = {
      profile: resolved.profile,
      style,
      engine,
      notice: resolved.notice,
    };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
