import type { ColorSwatch } from "../types";

// ---------------------------------------------------------------------------
// Style lexicon: the knowledge base behind the deterministic (no-API-key)
// analyzer. Each aesthetic maps keywords -> a coherent style world. The same
// vocabulary also seeds Claude's prompt context.
// ---------------------------------------------------------------------------

export interface AestheticDef {
  key: string;
  label: string;
  vibeName: string;
  keywords: string[];
  palette: ColorSwatch[];
  garments: string[];
  motifs: string[];
  textures: string[];
  traits: string[];
  signature: string;
  summary: string;
}

export const AESTHETICS: AestheticDef[] = [
  {
    key: "coastal",
    label: "coastal minimalist",
    vibeName: "Coastal Heirloom",
    keywords: [
      "linen", "coastal", "beach", "sea", "salt", "sand", "breton", "fisherman",
      "ceramic", "pottery", "driftwood", "harbour", "harbor", "swim", "oatmeal",
      "neutral", "seaglass", "sea glass", "tide", "fog", "knit", "porridge",
    ],
    palette: [
      { name: "Oat", hex: "#E7DAC4" },
      { name: "Sea Foam", hex: "#A9C2B5" },
      { name: "Driftwood", hex: "#9C8C76" },
      { name: "Wet Stone", hex: "#6E7A7C" },
      { name: "Chalk", hex: "#F3EDE2" },
    ],
    garments: ["linen shirt", "fisherman cable knit", "Breton stripe top", "wide trousers"],
    motifs: ["rolling waves", "sea glass", "knotted rope", "lone gull"],
    textures: ["washed linen", "chunky cable knit", "canvas"],
    traits: ["calm", "grounded", "unhurried"],
    signature: "a hand-knit cable detail in undyed cream",
    summary:
      "An unhurried, salt-washed wardrobe built on natural fibers and a muted seaside palette — linen, cream cable knits, and the kind of pieces that only get better the more they're worn.",
  },
  {
    key: "thriftDenim",
    label: "worn-in vintage",
    vibeName: "Worn-In Americana",
    keywords: [
      "thrift", "thrifted", "denim", "vintage", "levis", "band tee", "bandtee",
      "leather", "workwear", "chore", "vinyl", "record", "sneaker", "90s",
      "selvedge", "rust", "flannel", "graphic tee", "secondhand", "cratedigging",
    ],
    palette: [
      { name: "Faded Indigo", hex: "#4A5A73" },
      { name: "Rust", hex: "#A8552F" },
      { name: "Worn Black", hex: "#2C2A28" },
      { name: "Tobacco Tan", hex: "#9A6B3F" },
      { name: "Bone", hex: "#E8E2D5" },
    ],
    garments: ["broken-in leather jacket", "denim trucker jacket", "vintage band tee", "rust chore coat"],
    motifs: ["cracked screen print", "record sleeves", "sewn-on patches", "route markers"],
    textures: ["washed denim", "cracked leather", "thin faded cotton"],
    traits: ["nostalgic", "laid-back", "a true collector"],
    signature: "a faux-faded print that looks ten years loved on day one",
    summary:
      "A thrift-built, lived-in look that treats wear as a feature — washed indigo, cracked leather, and band tees thin as memory, all anchored in warm rust and tobacco tones.",
  },
  {
    key: "cottage",
    label: "cottagecore maker",
    vibeName: "Marmalade Cottage",
    keywords: [
      "cottagecore", "cottage", "cardigan", "sourdough", "baking", "garden",
      "floral", "embroidery", "foxglove", "pinafore", "yarn", "tea", "wildflower",
      "handmade", "handknit", "puff sleeve", "puffsleeve", "botanical", "mending",
    ],
    palette: [
      { name: "Marmalade", hex: "#D98A3D" },
      { name: "Dusty Rose", hex: "#C98B86" },
      { name: "Garden Sage", hex: "#8B9A6B" },
      { name: "Fresh Cream", hex: "#F5ECD8" },
      { name: "Honey", hex: "#E3B964" },
    ],
    garments: ["oversized chunky cardigan", "floral pinafore", "puff-sleeve blouse", "hand-knit pullover"],
    motifs: ["embroidered wildflowers", "fresh bread", "foxgloves", "slow stitches"],
    textures: ["chunky hand knit", "soft linen", "brushed wool"],
    traits: ["warm", "nurturing", "joyfully crafty"],
    signature: "a cluster of embroidered wildflowers stitched at the collar",
    summary:
      "A storybook-cozy, handmade-forward wardrobe of chunky cardigans, floral pinafores, and embroidered details, in a warm jar-of-marmalade palette softened by sage and cream.",
  },
  {
    key: "monoTech",
    label: "monochrome utility",
    vibeName: "Monochrome Utility",
    keywords: [
      "techwear", "monochrome", "allblack", "all black", "utility", "cargo",
      "shell", "brutalism", "concrete", "reflective", "minimalist", "minimal",
      "greyscale", "ripstop", "functional", "nightwalk", "urban", "tactical",
    ],
    palette: [
      { name: "True Black", hex: "#1A1A1C" },
      { name: "Carbon", hex: "#2E3033" },
      { name: "Gunmetal", hex: "#4C5258" },
      { name: "Ash Grey", hex: "#8B9094" },
      { name: "Signal White", hex: "#ECEEF0" },
    ],
    garments: ["taped-seam technical shell", "modular cargo pants", "heavyweight black tee", "minimal hoodie"],
    motifs: ["clean geometry", "reflective trim", "negative space", "modular grid"],
    textures: ["matte ripstop", "heavyweight cotton", "technical wool"],
    traits: ["precise", "understated", "city-paced"],
    signature: "a single geometric mark, dead-center, in reflective ink",
    summary:
      "A disciplined, monochrome wardrobe where function leads — taped shells, modular cargos, and one stark graphic against a greyscale field that lets texture do the talking.",
  },
  {
    key: "galleryColor",
    label: "maximalist colorist",
    vibeName: "Gallery Maximalist",
    keywords: [
      "colorblock", "color block", "maximalist", "maximalism", "gallery", "art",
      "bold", "clashing", "dopamine", "tangerine", "cobalt", "vibrant", "statement",
      "pattern", "colorful", "rainbow", "playful", "patternmixing",
    ],
    palette: [
      { name: "Tangerine", hex: "#E8743B" },
      { name: "Cobalt", hex: "#2F5FB0" },
      { name: "Lime Zest", hex: "#9FC131" },
      { name: "Raspberry", hex: "#C7397B" },
      { name: "Lilac", hex: "#9B7BC4" },
    ],
    garments: ["bold color-blocked coat", "clashing stripe sweater", "statement knit", "vivid trousers"],
    motifs: ["abstract color fields", "citrus shapes", "argumentative stripes", "paint swatches"],
    textures: ["smooth wool", "glossy finishes", "bouclé knit"],
    traits: ["playful", "expressive", "fearless"],
    signature: "two colors that shouldn't work together, made to sing",
    summary:
      "A joyful, more-is-more wardrobe of clashing color and bold blocking — tangerine against cobalt, lime beside raspberry — dressing like the brightest piece in the gallery.",
  },
];

/** Generic fallback when no aesthetic registers a clear signal. */
export const NEUTRAL_AESTHETIC: AestheticDef = {
  key: "eclectic",
  label: "everyday eclectic",
  vibeName: "Everyday Eclectic",
  keywords: [],
  palette: [
    { name: "Warm Sand", hex: "#D8C7AC" },
    { name: "Clay", hex: "#B7755A" },
    { name: "Sage", hex: "#8B9A6B" },
    { name: "Ink", hex: "#2C2A28" },
    { name: "Cream", hex: "#F3EDE2" },
  ],
  garments: ["everyday crewneck", "classic tee", "easy overshirt"],
  motifs: ["a quiet personal monogram", "a small repeated icon", "a clean horizon line"],
  textures: ["soft cotton", "brushed fleece", "light knit"],
  traits: ["easygoing", "versatile", "quietly confident"],
  signature: "a personal monogram in a warm accent tone",
  summary:
    "A flexible, easygoing wardrobe that mixes comfort staples with the occasional standout — grounded in warm earth tones and built for everyday wear.",
};

/** Color words -> swatches, to enrich a palette from raw caption text. */
export const COLOR_WORDS: Record<string, ColorSwatch> = {
  oatmeal: { name: "Oatmeal", hex: "#E7DAC4" },
  cream: { name: "Cream", hex: "#F3EDE2" },
  sage: { name: "Sage", hex: "#8B9A6B" },
  mustard: { name: "Mustard", hex: "#D8A12E" },
  marmalade: { name: "Marmalade", hex: "#D98A3D" },
  rust: { name: "Rust", hex: "#A8552F" },
  indigo: { name: "Indigo", hex: "#3C4A6B" },
  cobalt: { name: "Cobalt", hex: "#2F5FB0" },
  tangerine: { name: "Tangerine", hex: "#E8743B" },
  lilac: { name: "Lilac", hex: "#9B7BC4" },
  charcoal: { name: "Charcoal", hex: "#2E3033" },
  black: { name: "Black", hex: "#1A1A1C" },
  navy: { name: "Navy", hex: "#27324A" },
  raspberry: { name: "Raspberry", hex: "#C7397B" },
  lime: { name: "Lime", hex: "#9FC131" },
  sand: { name: "Sand", hex: "#D8C7AC" },
  honey: { name: "Honey", hex: "#E3B964" },
  rose: { name: "Dusty Rose", hex: "#C98B86" },
  pink: { name: "Pink", hex: "#E39AB0" },
  green: { name: "Green", hex: "#6E8B5A" },
  blue: { name: "Blue", hex: "#3F6FA3" },
  yellow: { name: "Yellow", hex: "#E6C24A" },
  grey: { name: "Grey", hex: "#8B9094" },
  gray: { name: "Grey", hex: "#8B9094" },
  brown: { name: "Brown", hex: "#7A5238" },
  tan: { name: "Tan", hex: "#C4A079" },
};
