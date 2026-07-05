import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  buildAuthorizeUrl,
  oauthConfigured,
  OAUTH_STATE_COOKIE,
} from "@/lib/instagram/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts the Instagram Login flow: mint a CSRF state, stash it in an httpOnly
// cookie, and redirect the user to Instagram's consent screen.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  if (!oauthConfigured()) {
    return NextResponse.redirect(
      `${origin}/create?connect_error=${encodeURIComponent(
        "Instagram connect isn't configured on this deployment yet.",
      )}`,
    );
  }

  const state = randomUUID();
  const res = NextResponse.redirect(buildAuthorizeUrl(origin, state));
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
