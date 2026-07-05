import { z } from "zod";
import type {
  GarmentType,
  ShopMerchant,
  ShopRecommendation,
  ShopResponse,
  StyleProfile,
} from "./types";
import { config } from "./config";
import { openaiJson } from "./openai";

// "Shop the vibe": GPT turns the visitor's real style profile into concrete,
// shoppable searches at merchants with affiliate programs, deep-linked through
// our affiliate credentials. Recommendations are real either way; links are
// monetized when AMAZON_ASSOCIATE_TAG / SKIMLINKS_SITE_ID are configured
// (`monetized` drives the FTC disclosure in the UI).
//
// Note: live per-product data (Amazon PA-API etc.) requires approved accounts
// with sales history, so day-1 recommendations deep-link into merchant search
// results — honest, robust, and no scraping.

const MERCHANTS: Record<
  ShopMerchant,
  { label: string; search: (q: string) => string }
> = {
  amazon: {
    label: "Amazon",
    search: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=fashion`,
  },
  etsy: {
    label: "Etsy",
    search: (q) => `https://www.etsy.com/search?q=${encodeURIComponent(q)}`,
  },
  nordstrom: {
    label: "Nordstrom",
    search: (q) => `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(q)}`,
  },
  asos: {
    label: "ASOS",
    search: (q) => `https://www.asos.com/us/search/?q=${encodeURIComponent(q)}`,
  },
  madewell: {
    label: "Madewell",
    search: (q) => `https://www.madewell.com/search?q=${encodeURIComponent(q)}`,
  },
  everlane: {
    label: "Everlane",
    search: (q) => `https://www.everlane.com/search?q=${encodeURIComponent(q)}`,
  },
  zara: {
    label: "Zara",
    search: (q) => `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(q)}`,
  },
  uniqlo: {
    label: "Uniqlo",
    search: (q) => `https://www.uniqlo.com/us/en/search?q=${encodeURIComponent(q)}`,
  },
};

const MERCHANT_KEYS = Object.keys(MERCHANTS) as [ShopMerchant, ...ShopMerchant[]];

/** Applies affiliate monetization to a merchant search URL. */
function monetizeUrl(merchant: ShopMerchant, url: string): string {
  if (merchant === "amazon") {
    return config.affiliate.amazonTag
      ? `${url}&tag=${encodeURIComponent(config.affiliate.amazonTag)}`
      : url;
  }
  return config.affiliate.skimlinksId
    ? `https://go.skimresources.com/?id=${encodeURIComponent(
        config.affiliate.skimlinksId,
      )}&xs=1&url=${encodeURIComponent(url)}`
    : url;
}

const recSchema = z.object({
  recommendations: z
    .array(
      z.object({
        merchant: z.enum(MERCHANT_KEYS),
        query: z.string().min(2),
        title: z.string().min(2),
        why: z.string().min(2),
        priceBand: z.enum(["$", "$$", "$$$"]).catch("$$"),
      }),
    )
    .min(3)
    .max(6),
});

const GARMENT_WORD: Record<GarmentType, string> = {
  sweater: "sweaters and knitwear",
  tee: "t-shirts and heavyweight tees",
  jacket: "jackets, overshirts, and chore coats",
};

const SYSTEM_PROMPT = `You are Cozy Tops' personal shopper. Given a customer's style profile and the garment category they're exploring, recommend 5 real-world pieces they could shop for today at well-known retailers.

Each recommendation must be a CONCRETE product search — specific color, material, cut, and garment (e.g. "cream cable knit fisherman sweater women", not "nice sweater") — that will surface strong matches on the chosen retailer. Match retailers to the pick: Etsy for handmade/vintage energy, Nordstrom for premium, ASOS/Zara for trend, Uniqlo/Everlane for essentials, Madewell for denim-adjacent Americana, Amazon for broad basics.

Tie every pick to who they are. Vary the retailers (no more than 2 from the same one).

Respond with ONLY a JSON object (no prose, no code fence):
{
  "recommendations": [
    {
      "merchant": "amazon|etsy|nordstrom|asos|madewell|everlane|zara|uniqlo",
      "query": string,      // the concrete search, incl. color/material/fit
      "title": string,      // short display name for the pick
      "why": string,        // one sentence, second person, tied to their style
      "priceBand": "$" | "$$" | "$$$"
    },
    ... 5 recommendations
  ]
}`;

/** Generates affiliate-linked shop recommendations. Throws (loudly) on failure. */
export async function generateShopRecommendations(
  style: StyleProfile,
  garment: GarmentType,
): Promise<ShopResponse> {
  const raw = await openaiJson({
    instructions: SYSTEM_PROMPT,
    content: [
      {
        type: "input_text",
        text: `Recommend 5 shoppable pieces (as JSON) in the category "${GARMENT_WORD[garment]}" for @${style.handle}.

STYLE PROFILE
Vibe: ${style.vibeName}
Summary: ${style.summary}
Aesthetics: ${style.aesthetics.join(", ")}
Motifs: ${style.motifs.join(", ")}
Textures: ${style.textures.join(", ")}
Palette: ${style.palette.map((p) => p.name).join(", ")}
Signature: ${style.signatureMotif}`,
      },
    ],
    maxOutputTokens: 1400,
  });

  const parsed = recSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Shop recommendations failed validation — please try again.");
  }

  const recommendations: ShopRecommendation[] = parsed.data.recommendations.map(
    (r) => ({
      merchant: r.merchant,
      merchantLabel: MERCHANTS[r.merchant].label,
      title: r.title,
      why: r.why,
      priceBand: r.priceBand,
      url: monetizeUrl(r.merchant, MERCHANTS[r.merchant].search(r.query)),
    }),
  );

  return { recommendations, monetized: config.affiliate.monetized };
}
