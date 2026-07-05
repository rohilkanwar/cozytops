import { config } from "../config";

// ---------------------------------------------------------------------------
// Instagram Login (OAuth 2.0) authorization-code flow. We only ever read the
// authorizing user's OWN account, with their consent, using a short-lived
// token that lives in an httpOnly cookie for the session and is never persisted
// server-side. Endpoints/scopes are env-configurable because Meta's Instagram
// login products + scope names shift over time.
//
// Production requires a Meta developer app with Instagram Login configured and
// App Review for the requested scopes. src/lib/instagram/graph.ts consumes the
// resulting token.
// ---------------------------------------------------------------------------

export const OAUTH_STATE_COOKIE = "ig_oauth_state";
export const OAUTH_TOKEN_COOKIE = "ig_token";
/** Session lifetime for the connected token (short-lived, ~1h). */
export const TOKEN_MAX_AGE_SECONDS = 60 * 60;

export function oauthConfigured(): boolean {
  return config.instagram.oauth.enabled;
}

/** The registered redirect URI, or one derived from the current origin. */
export function redirectUri(origin: string): string {
  return config.instagram.oauth.redirectUri || `${origin}/api/auth/instagram/callback`;
}

/** Builds the Instagram authorize URL to send the user to. */
export function buildAuthorizeUrl(origin: string, state: string): string {
  const { authUrl, clientId, scopes } = config.instagram.oauth;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: scopes,
    state,
  });
  return `${authUrl}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for a short-lived access token. Tolerates
 * both the flat ({access_token,...}) and array ({data:[{access_token}]}) shapes
 * Instagram has used across product versions.
 */
export async function exchangeCodeForToken(
  origin: string,
  code: string,
): Promise<string> {
  const { tokenUrl, clientId, clientSecret } = config.instagram.oauth;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri(origin),
    code,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    let message = `Instagram token exchange failed (${res.status})`;
    try {
      const parsed = JSON.parse(raw) as {
        error_message?: string;
        error?: { message?: string } | string;
      };
      const detail =
        parsed.error_message ||
        (typeof parsed.error === "string" ? parsed.error : parsed.error?.message);
      if (detail) message = `Instagram token exchange failed: ${detail}`;
    } catch {
      /* keep generic message */
    }
    throw new Error(message);
  }

  let token: string | undefined;
  try {
    const parsed = JSON.parse(raw) as {
      access_token?: string;
      data?: { access_token?: string }[];
    };
    token = parsed.access_token || parsed.data?.[0]?.access_token;
  } catch {
    throw new Error("Instagram token exchange returned an unreadable response.");
  }
  if (!token) {
    throw new Error("Instagram token exchange returned no access token.");
  }
  return token;
}
