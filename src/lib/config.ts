// Centralized, server-side configuration. Reads env once and exposes typed
// flags so the rest of the app never touches process.env directly.

export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Cozy Tops",

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    // Text + vision reasoning model (style analysis, design briefs).
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-4.1",
    get enabled() {
      return Boolean(process.env.OPENAI_API_KEY);
    },
  },

  instagram: {
    // Public-handle lookups ("type any public @handle"). No default: unset
    // fails loudly rather than silently serving sample personas. "demo" must be
    // chosen explicitly. (INSTAGRAM_PROVIDER kept for back-compat.)
    publicProvider: (process.env.INSTAGRAM_PUBLIC_PROVIDER ||
      process.env.INSTAGRAM_PROVIDER ||
      "") as "" | "demo" | "apify",
    apifyToken: process.env.APIFY_TOKEN || "",

    // OAuth self-connect ("Connect your Instagram") — reads the visitor's OWN
    // account, private included, with their consent, via a short-lived token.
    oauth: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      // Must exactly match a redirect URI registered on the Meta app. When
      // unset we derive `${origin}/api/auth/instagram/callback` at request time.
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "",
      authUrl:
        process.env.INSTAGRAM_OAUTH_AUTH_URL || "https://www.instagram.com/oauth/authorize",
      tokenUrl:
        process.env.INSTAGRAM_OAUTH_TOKEN_URL || "https://api.instagram.com/oauth/access_token",
      graphBase: process.env.INSTAGRAM_GRAPH_BASE || "https://graph.instagram.com",
      scopes: process.env.INSTAGRAM_OAUTH_SCOPES || "instagram_business_basic",
      get enabled() {
        return Boolean(
          process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET,
        );
      },
    },
  },

  affiliate: {
    // Amazon Associates tracking tag (e.g. "cozytops-20"). Appended to Amazon
    // links when set.
    amazonTag: process.env.AMAZON_ASSOCIATE_TAG || "",
    // Skimlinks publisher site id. When set, non-Amazon merchant links are
    // wrapped via go.skimresources.com so ~48k merchants pay out through one
    // account.
    skimlinksId: process.env.SKIMLINKS_SITE_ID || "",
    get monetized() {
      return Boolean(process.env.AMAZON_ASSOCIATE_TAG || process.env.SKIMLINKS_SITE_ID);
    },
  },

  fulfillment: {
    provider: (process.env.FULFILLMENT_PROVIDER || "demo") as
      | "demo"
      | "printful"
      | "shopify",
    printfulApiKey: process.env.PRINTFUL_API_KEY || "",
    shopifyDomain: process.env.SHOPIFY_STORE_DOMAIN || "",
    shopifyToken: process.env.SHOPIFY_ADMIN_TOKEN || "",
  },

  image: {
    provider: (process.env.IMAGE_PROVIDER ||
      (process.env.OPENAI_API_KEY ? "openai" : "none")) as "openai" | "none",
    openaiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    quality: (process.env.IMAGE_QUALITY || "high") as
      | "low"
      | "medium"
      | "high"
      | "auto",
    // Cheaper tier for option-card thumbnails; the full set renders at
    // `quality` only for the design the visitor actually selects.
    previewQuality: (process.env.IMAGE_PREVIEW_QUALITY || "medium") as
      | "low"
      | "medium"
      | "high"
      | "auto",
    get enabled() {
      const provider =
        process.env.IMAGE_PROVIDER ||
        (process.env.OPENAI_API_KEY ? "openai" : "none");
      return provider !== "none" && Boolean(process.env.OPENAI_API_KEY);
    },
  },
} as const;
