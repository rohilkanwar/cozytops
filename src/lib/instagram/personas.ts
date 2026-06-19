import type { InstagramPost } from "../types";

// ---------------------------------------------------------------------------
// Curated demo personas. Each archetype is a self-contained "style world" with
// captions, hashtags, and image descriptions rich enough to drive a believable
// style read — no scraping, no credentials, ToS-safe.
//
// In demo mode ANY handle resolves to one of these archetypes (chosen
// deterministically from the handle), then lightly personalized, so the
// experience feels real for every visitor.
// ---------------------------------------------------------------------------

export interface PersonaArchetype {
  key: string;
  displayName: string;
  bio: string;
  posts: Omit<InstagramPost, "id">[];
}

export const ARCHETYPES: PersonaArchetype[] = [
  {
    key: "coastal-loom",
    displayName: "Sun & Saltwater",
    bio: "linen, low tide, and slow mornings ﹒ ceramics + cold swims ﹒ she/her",
    posts: [
      {
        caption:
          "Wore the same oatmeal linen set three days running and have no notes. Sandy hems are a personality trait now.",
        hashtags: ["#linenlove", "#neutralstyle", "#coastalgrandma", "#slowliving"],
        imageAlt:
          "A person in a loose oatmeal linen shirt and wide trousers standing on pale dunes, soft overcast light, muted sand and sea-glass tones.",
        likeCount: 1840,
        mediaType: "image",
      },
      {
        caption:
          "Cold swim, warmer sweater. This cream fisherman knit has survived four winters and I refuse to retire it.",
        hashtags: ["#fishermanknit", "#aranknit", "#coldwaterswim", "#knitwear"],
        imageAlt:
          "Chunky cream cable-knit sweater over a swimsuit, person wrapped in a sandy towel by grey-blue water, cool natural light.",
        likeCount: 2210,
        mediaType: "image",
      },
      {
        caption: "Threw two pots and one tantrum today. Glaze in 'sea foam' and 'wet stone'.",
        hashtags: ["#ceramics", "#pottery", "#earthtones", "#maker"],
        imageAlt:
          "Hands cradling a freshly glazed stoneware mug in soft sage and chalky white, clay-dusted apron, warm studio shadows.",
        likeCount: 1320,
        mediaType: "image",
      },
      {
        caption: "Striped boatneck + the world's most beat-up canvas totes. Coastal uniform locked in.",
        hashtags: ["#bretonstripes", "#capsulewardrobe", "#minimalstyle"],
        imageAlt:
          "Navy-and-cream Breton striped top, faded canvas tote, person walking a harbour path, soft diffused light.",
        likeCount: 1990,
        mediaType: "image",
      },
      {
        caption: "Driftwood, sea glass, one very smug gull. Color story of the whole month honestly.",
        hashtags: ["#beachcombing", "#seaglass", "#naturepalette"],
        imageAlt:
          "Flatlay of bleached driftwood, frosted sea glass in greens and milky blues, pale sand background.",
        likeCount: 1110,
        mediaType: "carousel",
      },
      {
        caption: "Morning porridge, hand-knit socks, fog that refuses to lift. Cozy is a discipline.",
        hashtags: ["#slowmorning", "#handknit", "#cozyseason"],
        imageAlt:
          "Wool-socked feet beside a steaming bowl, undyed cream and grey knit blanket, foggy window light.",
        likeCount: 1470,
        mediaType: "image",
      },
    ],
  },
  {
    key: "thrift-denim",
    displayName: "Rust & Denim",
    bio: "thrifted everything ﹒ 90s denim ﹒ band tees older than me ﹒ crate digging",
    posts: [
      {
        caption:
          "$6 leather jacket from the bins, broke it in myself. The cracks are the whole point.",
        hashtags: ["#thrifted", "#vintageleather", "#thriftflip", "#workwear"],
        imageAlt:
          "Worn cognac-brown leather moto jacket over a faded graphic tee, scuffed boots, brick wall, gritty afternoon light.",
        likeCount: 3120,
        mediaType: "image",
      },
      {
        caption: "Double denim is not a crime it's a lifestyle. Washed-out indigo on washed-out indigo.",
        hashtags: ["#doubledenim", "#vintagelevis", "#90sstyle", "#denimhead"],
        imageAlt:
          "Light-wash denim jacket over darker raw selvedge jeans, white tee underneath, urban garage backdrop.",
        likeCount: 2780,
        mediaType: "image",
      },
      {
        caption: "Crate dig haul. Soul, dub, one mystery record with no label. Sleeve art > everything.",
        hashtags: ["#vinyl", "#cratedigging", "#recordstore"],
        imageAlt:
          "Stack of worn vinyl sleeves in burnt orange, mustard, and faded red, dusty record-shop lighting.",
        likeCount: 1640,
        mediaType: "carousel",
      },
      {
        caption: "Band tee so thin it's basically a memory. Iron-on cracked just right.",
        hashtags: ["#bandtee", "#graphictee", "#vintagetshirt", "#fadedblack"],
        imageAlt:
          "Faded charcoal-black vintage band t-shirt with cracked white print, layered under flannel, moody indoor light.",
        likeCount: 2410,
        mediaType: "image",
      },
      {
        caption: "Workwear chore coat, rust-colored, smells like sawdust and good decisions.",
        hashtags: ["#chorecoat", "#workwear", "#heritagestyle", "#rusttones"],
        imageAlt:
          "Rust-orange cotton chore jacket with patch pockets, raw denim, tan boots, workshop background.",
        likeCount: 1980,
        mediaType: "image",
      },
      {
        caption: "Sneaker rotation is 90% beat-up white leather and I will not be apologizing.",
        hashtags: ["#sneakers", "#vintagekicks", "#wornin"],
        imageAlt:
          "Scuffed off-white leather sneakers on cracked asphalt, cuffed indigo denim, hard daylight.",
        likeCount: 1520,
        mediaType: "image",
      },
    ],
  },
  {
    key: "cottage-knit",
    displayName: "Marmalade Mornings",
    bio: "chunky knits ﹒ sourdough ﹒ garden chaos ﹒ tea always ﹒ collecting florals",
    posts: [
      {
        caption:
          "Knit this mustard cardigan over three rainy weekends. Pockets big enough for a whole scone.",
        hashtags: ["#handknit", "#chunkyknit", "#cottagecore", "#cardigan"],
        imageAlt:
          "Oversized mustard-yellow chunky knit cardigan with wooden buttons, floral dress underneath, garden greenery behind.",
        likeCount: 2640,
        mediaType: "image",
      },
      {
        caption: "Sourdough finally got its ears. Crumb shot for the people who understand.",
        hashtags: ["#sourdough", "#baking", "#slowfood", "#cottagekitchen"],
        imageAlt:
          "Golden-crusted sourdough loaf on a floured linen towel, warm butter and honey tones, cozy kitchen light.",
        likeCount: 1890,
        mediaType: "image",
      },
      {
        caption: "Garden is 60% foxgloves, 40% chaos. Pressed a few for a future embroidery project.",
        hashtags: ["#cottagegarden", "#floral", "#foxgloves", "#botanical"],
        imageAlt:
          "Cottage garden bursting with foxgloves and roses in dusty pink, sage, and cream, soft golden-hour light.",
        likeCount: 1730,
        mediaType: "carousel",
      },
      {
        caption: "Tea, wool socks, an embarrassingly large pile of yarn. This is the whole personality.",
        hashtags: ["#cozyhome", "#yarnlover", "#teatime", "#slowliving"],
        imageAlt:
          "Mug of tea beside baskets of yarn in marmalade, dusty rose, and sage, knit blanket, warm window light.",
        likeCount: 1410,
        mediaType: "image",
      },
      {
        caption: "Pinafore + puff sleeves + muddy boots. Dressing like a storybook and thriving.",
        hashtags: ["#pinafore", "#puffsleeves", "#cottagecorefashion", "#floraldress"],
        imageAlt:
          "Person in a sage pinafore over a floral puff-sleeve blouse, muddy boots, leaning on a garden fence.",
        likeCount: 2010,
        mediaType: "image",
      },
      {
        caption: "Embroidered wildflowers onto an old collar. Slow stitches, loud joy.",
        hashtags: ["#embroidery", "#handmade", "#wildflowers", "#mending"],
        imageAlt:
          "Close-up of hand-embroidered wildflowers in marmalade and sage on a cream linen collar, hoop and thread nearby.",
        likeCount: 1280,
        mediaType: "image",
      },
    ],
  },
  {
    key: "mono-tech",
    displayName: "Concrete & Carbon",
    bio: "monochrome only ﹒ utility > everything ﹒ city walks at night ﹒ black is a color",
    posts: [
      {
        caption: "All black, all weather. Technical shell that actually breathes. Form follows function.",
        hashtags: ["#techwear", "#monochrome", "#allblack", "#utility"],
        imageAlt:
          "Matte-black technical shell jacket with taped seams and utility straps, charcoal cargo pants, neon-lit wet pavement at night.",
        likeCount: 4120,
        mediaType: "image",
      },
      {
        caption: "Negative space is a flex. One graphic, dead center, nothing else.",
        hashtags: ["#minimalist", "#monochrome", "#graphictee", "#streetwear"],
        imageAlt:
          "Plain black heavyweight tee with a small white geometric print at center chest, clean studio backdrop.",
        likeCount: 2980,
        mediaType: "image",
      },
      {
        caption: "Brutalist stairwell, brutalist fit. Concrete is the only acceptable backdrop.",
        hashtags: ["#brutalism", "#architecture", "#cityscape", "#greytones"],
        imageAlt:
          "Person in head-to-toe charcoal and black standing in a raw concrete stairwell, hard directional shadows.",
        likeCount: 2510,
        mediaType: "image",
      },
      {
        caption: "Cargo pockets > excuses. Carry everything, look like nothing happened.",
        hashtags: ["#cargopants", "#functionalfashion", "#techwear"],
        imageAlt:
          "Tapered black cargo pants with modular pockets, black runners, gunmetal hardware, dim garage light.",
        likeCount: 1870,
        mediaType: "image",
      },
      {
        caption: "Night walk uniform: black shell, grey hood, silence. Reflective trim does the talking.",
        hashtags: ["#nightwalk", "#reflective", "#urban", "#monochrome"],
        imageAlt:
          "Figure in a grey hood and black shell on an empty night street, faint reflective trim catching streetlight.",
        likeCount: 2230,
        mediaType: "reel",
      },
      {
        caption: "Texture is the only color I allow. Matte vs. ripstop vs. wool. Greyscale forever.",
        hashtags: ["#textureover color", "#greyscale", "#minimal"],
        imageAlt:
          "Flatlay of black and charcoal garments in matte cotton, ripstop nylon, and wool, top-down even light.",
        likeCount: 1640,
        mediaType: "carousel",
      },
    ],
  },
  {
    key: "gallery-color",
    displayName: "Tangerine Dream",
    bio: "wear the rainbow ﹒ gallery hopping ﹒ clashing on purpose ﹒ thrifted maximalism",
    posts: [
      {
        caption:
          "Tangerine coat, cobalt trousers, a green bag that has no business working but does.",
        hashtags: ["#colorblocking", "#dopamine dressing", "#maximalist", "#bold style"],
        imageAlt:
          "Bright tangerine wool coat over cobalt-blue trousers and a grass-green shoulder bag, white gallery wall behind.",
        likeCount: 3640,
        mediaType: "image",
      },
      {
        caption: "Gallery day = dressing to match the art. Today's exhibit: a lot of yellow.",
        hashtags: ["#artgallery", "#contemporaryart", "#colorpop", "#museumootd"],
        imageAlt:
          "Person in a sunflower-yellow knit standing before a large abstract canvas of red and pink, bright gallery lighting.",
        likeCount: 2890,
        mediaType: "image",
      },
      {
        caption: "Stripes that argue with each other. Red, lilac, lime. Harmony is overrated.",
        hashtags: ["#stripes", "#clashingprints", "#playfulstyle"],
        imageAlt:
          "Bold multi-color striped sweater in red, lilac, and lime, person mid-laugh against a hot-pink wall.",
        likeCount: 2470,
        mediaType: "image",
      },
      {
        caption: "Thrifted a coat the color of a popsicle. Six dollars. Wept with joy in the aisle.",
        hashtags: ["#thrifted", "#secondhand", "#colorful", "#vintagecoat"],
        imageAlt:
          "Glossy raspberry-pink vintage coat held up triumphantly in a thrift store, fluorescent light, racks behind.",
        likeCount: 2150,
        mediaType: "carousel",
      },
      {
        caption: "Earrings the size of small fruit. Print on print on print. More is more, always.",
        hashtags: ["#maximalism", "#statementjewelry", "#patternmixing"],
        imageAlt:
          "Close-up of oversized citrus-shaped earrings, layered patterned scarves in orange and turquoise, joyful expression.",
        likeCount: 1980,
        mediaType: "image",
      },
      {
        caption: "Color palette of the week, courtesy of a fruit stand and a flat of pansies.",
        hashtags: ["#colorinspo", "#palette", "#everydaycolor"],
        imageAlt:
          "Vibrant flatlay of citrus fruit and purple-and-yellow pansies, saturated tangerine, violet, and green.",
        likeCount: 1520,
        mediaType: "carousel",
      },
    ],
  },
];
