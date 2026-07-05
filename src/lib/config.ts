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
    // No default: an unset provider fails loudly rather than silently serving
    // sample personas. "demo" must be chosen explicitly.
    provider: (process.env.INSTAGRAM_PROVIDER || "") as
      | ""
      | "demo"
      | "graph"
      | "apify",
    graphToken: process.env.INSTAGRAM_GRAPH_TOKEN || "",
    apifyToken: process.env.APIFY_TOKEN || "",
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
    get enabled() {
      const provider =
        process.env.IMAGE_PROVIDER ||
        (process.env.OPENAI_API_KEY ? "openai" : "none");
      return provider !== "none" && Boolean(process.env.OPENAI_API_KEY);
    },
  },
} as const;
