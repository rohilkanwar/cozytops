// ---------------------------------------------------------------------------
// Shared domain types for the Cozy Tops pipeline:
//   Instagram persona  ->  Style profile  ->  Design brief  ->  Product/Order
// ---------------------------------------------------------------------------

/** A single public post pulled from an Instagram persona. */
export interface InstagramPost {
  id: string;
  /** User-written caption (primary multimodal text signal). */
  caption: string;
  hashtags: string[];
  /** Public image URL (used by the real vision path). */
  imageUrl?: string;
  /**
   * A textual description of what the image shows. In demo mode this is
   * hand-authored; with a real vision model it is generated from imageUrl.
   */
  imageAlt: string;
  likeCount?: number;
  takenAt?: string;
  mediaType?: "image" | "carousel" | "reel";
}

/** A resolved public Instagram persona. */
export interface InstagramProfile {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  postCount: number;
  posts: InstagramPost[];
  /** How this profile was sourced — surfaced to the user for transparency. */
  source: "demo" | "graph" | "apify";
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

/**
 * The heart of the product: a structured read of someone's personal style,
 * synthesized from their captions, hashtags, and imagery.
 */
export interface StyleProfile {
  handle: string;
  /** A coined, evocative name for their aesthetic. */
  vibeName: string;
  /** 2-3 sentence narrative summary of how they dress + present. */
  summary: string;
  palette: ColorSwatch[];
  /** Aesthetic tags: "earthy", "minimalist", "coastal", "streetwear"... */
  aesthetics: string[];
  /** Garments they gravitate toward / show off. */
  garmentAffinities: string[];
  /** Recurring visual + thematic motifs. */
  motifs: string[];
  /** Material / texture leanings: "chunky knit", "washed denim"... */
  textures: string[];
  /** Personality traits inferred from how they present themselves. */
  personaTraits: string[];
  /** The single most "them" thing — what we personify on the garment. */
  signatureMotif: string;
  /** 0-1 confidence in the read, driven by signal quantity + clarity. */
  confidence: number;
  /** Explainability: which posts drove which conclusions. */
  evidence: StyleEvidence[];
}

export interface StyleEvidence {
  postId: string;
  observation: string;
}

export type GarmentType = "sweater" | "tee" | "jacket";

export type DesignPattern =
  | "solid"
  | "stripes"
  | "fairisle"
  | "colorblock"
  | "speckle"
  | "gradient";

/**
 * A concrete, manufacturable design tailored to a StyleProfile, including the
 * "personification" element that ties the piece to the person.
 */
export interface DesignBrief {
  garment: GarmentType;
  /** The named, one-of-one piece, e.g. "The Tidewatcher Crew". */
  title: string;
  /** Personification: a 1-2 sentence story tying the piece to the persona. */
  story: string;
  palette: ColorSwatch[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: DesignPattern;
  /** Short motif phrases used as design cues + tiny rendered emblems. */
  motifs: string[];
  /** 1-3 character monogram embroidered/printed on the chest. */
  monogram: string;
  /** Where + how the personification lives on the garment. */
  placementNotes: string;
  materials: string;
  /** A cozy one-liner about how it should feel to wear. */
  careVibe: string;
}

export interface Product {
  garment: GarmentType;
  name: string;
  blurb: string;
  basePriceUsd: number;
  sizes: string[];
  leadTimeDays: number;
}

export interface OrderRequest {
  handle: string;
  garment: GarmentType;
  size: string;
  design: DesignBrief;
}

export interface OrderConfirmation {
  orderId: string;
  status: "confirmed" | "simulated";
  provider: "demo" | "printful" | "shopify";
  etaDays: number;
  totalUsd: number;
  message: string;
}

// --- API payloads ----------------------------------------------------------

export interface AnalyzeResponse {
  profile: InstagramProfile;
  style: StyleProfile;
  /** Which engine produced the style read. */
  engine: "claude-vision" | "claude-text" | "heuristic";
  notice?: string;
}

export interface DesignResponse {
  design: DesignBrief;
  /** Inline SVG markup for the garment mockup. */
  mockupSvg: string;
  engine: "claude" | "heuristic";
}

export type ShotKind = "product" | "model";

/** A photorealistic, AI-generated garment image. */
export interface GarmentImage {
  kind: ShotKind;
  /** A data: URL (base64 PNG) or a remote URL. */
  src: string;
  alt: string;
}

export interface RenderResponse {
  image?: GarmentImage;
  /** True when no image provider is configured — client falls back to SVG. */
  unavailable?: boolean;
}
