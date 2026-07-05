import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  OAUTH_STATE_COOKIE,
  OAUTH_TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/instagram/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Instagram redirects here with ?code&state (or ?error). We verify the CSRF
// state, exchange the code for a short-lived token, drop it in an httpOnly
// cookie for the session, and send the user into the connected flow.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (msg: string) =>
    NextResponse.redirect(`${origin}/create?connect_error=${encodeURIComponent(msg)}`);

  const err = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (err) return fail(`Instagram declined the connection: ${err}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("The Instagram sign-in couldn't be verified. Please try again.");
  }

  let token: string;
  try {
    token = await exchangeCodeForToken(origin, code);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Instagram sign-in failed.");
  }

  const res = NextResponse.redirect(`${origin}/create?connected=1`);
  res.cookies.set(OAUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}
