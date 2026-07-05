import { NextResponse } from "next/server";
import { OAUTH_TOKEN_COOKIE } from "@/lib/instagram/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Disconnect: forget the session token immediately.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(OAUTH_TOKEN_COOKIE);
  return res;
}
