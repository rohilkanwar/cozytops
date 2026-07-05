# Cozy Tops 🧶

**A one-of-one top, designed from your vibe.**

Drop a public Instagram handle and Cozy Tops reads your personal style — your
colors, textures, the garments you gravitate to, the way you put yourself
together — then designs a custom **sweater**, **tee**, or **jacket** made just
for you, complete with a *personification* detail pulled straight from who you
are. Approve it, and a partner studio handles manufacturing and shipping.

This repo is the **customer-facing experience**. Every stage is real — live
Instagram data, GPT vision analysis, model-authored designs, photorealistic
imagery — and there are **no silent fallbacks**: a stage that can't run its
real pipeline fails loudly instead of quietly serving sample data.

---

## The experience

```
Instagram handle ─▶ Style read ─▶ Custom design ─▶ Photos ─▶ Order
  (Apify/Graph)      (GPT vision)   (GPT-authored     (gpt-      (Printful /
                                     brief)            image-2)   Shopify / demo)
```

1. **Share a handle** on the landing page.
2. **`/api/analyze`** resolves the profile via the configured Instagram
   source and runs GPT vision over the real photos + captions. Returns a
   structured `StyleProfile` (vibe name, palette, aesthetics, garment
   affinities, motifs, a signature detail, and explainable evidence). If no
   source is configured or the fetch/analysis fails, the API returns an
   explicit error — never a sample persona.
3. **`/api/design`** turns that profile + a chosen garment into FOUR distinct
   manufacturable `DesignBrief` options (named piece, color story, pattern,
   personification story — monogram only as an occasional accent), each
   rendered as real product + on-model photography.
4. **`/api/shop`** turns the style read into "Shop the vibe" — concrete,
   style-matched picks at real retailers (Amazon, Nordstrom, Etsy, ASOS,
   Uniqlo, Everlane, Madewell, Zara), deep-linked through your affiliate
   credentials (`AMAZON_ASSOCIATE_TAG` for Amazon, `SKIMLINKS_SITE_ID` for
   everyone else). Links carry rel="sponsored" and the UI shows a commission
   disclosure whenever monetization is active.
5. **`/api/checkout`** hands the design + size to a fulfillment provider.

## No silent fallbacks

Each stage requires its configuration and fails loudly when it's missing or
its provider errors. Sample data only appears behind an explicit opt-in and is
always labeled as such:

| Capability | Unconfigured / provider failure | Configured |
|---|---|---|
| Instagram data | Explicit error (`INSTAGRAM_PROVIDER` unset) or the provider's real error — never a stand-in persona | `apify` (licensed data vendor, real public posts) or `graph` (visitor's own account via OAuth). `demo` is an explicit opt-in, labeled "sample persona" |
| Style analysis | Explicit error | GPT vision over the real post photos (`OPENAI_API_KEY`) |
| Garment design | Explicit error | GPT-authored design brief |
| Imagery | Explicit error | gpt-image-2 photorealistic product + on-model shots (async background jobs) |
| Fulfillment | Real partner failure = error, order NOT placed | `printful` / `shopify`; default `demo` returns a confirmation explicitly marked SIMULATED |

## Operational notes (the honest part)

These are the "to be figured out operationally" pieces from the brief. The code
is structured so they're swappable, and demo mode never depends on them:

- **Instagram access is the real constraint.** The official Graph API only
  returns media for accounts that have authorized *your* app via Instagram
  Login — i.e. the visitor connects their *own* account and consents. You
  cannot fetch an arbitrary public handle through the official API. The
  ToS-compliant options are (a) Instagram Login for the visitor's own account,
  or (b) a reputable, licensed data vendor for public posts, always with clear
  disclosure + consent. `src/lib/instagram/{graph,apify}.ts` sketch both. **Do
  not** bolt on unauthorized scraping.
- **Fulfillment** is a print-on-demand / storefront integration. Printful is the
  most natural fit for one-off custom garments (upload artwork → create order
  against a variant); Shopify works as the storefront + hosted checkout. Both
  need a variant/SKU map and an artwork-upload step before they ship for real
  (`src/lib/fulfillment/{printful,shopify}.ts`).
- **Privacy:** only public content, only with consent, and we don't persist
  photos. Make this real (and lawful for your jurisdiction) before launch.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — everything works without keys
npm run dev                  # http://localhost:3000
```

Set `OPENAI_API_KEY` plus an Instagram source (`INSTAGRAM_PROVIDER=apify` +
`APIFY_TOKEN`, or `INSTAGRAM_PROVIDER=demo` for labeled sample personas) —
without them the app fails loudly by design.

```bash
npm run build && npm start   # production build
npm run typecheck            # types
npm run lint                 # lint
```

## Project structure

```
src/
  app/
    page.tsx                 Landing page (real generated campaign photos)
    create/page.tsx          The experience (reads ?handle=)
    api/
      analyze/route.ts       handle  -> InstagramProfile + StyleProfile
      design/route.ts        style   -> 4 DesignBrief options
      shop/route.ts          style   -> affiliate-linked retail picks
      checkout/route.ts      design  -> OrderConfirmation
  components/
    create/                  The end-to-end client experience + sub-views
    Hero, HowItWorks, ...    Landing-page sections
  lib/
    instagram/               Provider interface, demo personas, graph/apify
    analysis/                GPT vision style analyzer (+ lexicon of vibe seeds)
    design/                  GPT design generator (4 options), async image pipeline
    fulfillment/             Catalog + order orchestration (demo/printful/shopify)
    openai.ts, config.ts, types.ts
```

## Extending it

- **Style vision:** when posts carry image URLs (real provider), the analyzer
  fetches and sends them to GPT as image blocks for genuine visual analysis;
  the engine badge shows whether vision or text-only analysis ran.
- **New garments:** add to `CATALOG` (`lib/fulfillment`), `GARMENTS`
  (`components/garmentMeta.ts`), and a garment description in
  `lib/design/imagegen.ts`.

## Deploy

The app is a standard Next.js project. A live deployment needs
`OPENAI_API_KEY` and `INSTAGRAM_PROVIDER=apify` + `APIFY_TOKEN` (or an explicit
`INSTAGRAM_PROVIDER=demo` for labeled sample personas).

### Vercel (recommended)

Zero-config — Vercel detects Next.js automatically.

1. Push to GitHub (already done).
2. At [vercel.com/new](https://vercel.com/new), **Import** the `cozytops` repo.
3. Framework preset auto-detects **Next.js**; leave build/output settings at
   defaults. Add `OPENAI_API_KEY`, `INSTAGRAM_PROVIDER=apify`, and
   `APIFY_TOKEN` under *Environment Variables*.
4. **Deploy.** You get a `*.vercel.app` URL; pushes auto-redeploy.

> Note: Vercel's *Production Branch* defaults to the repo's default branch
> (currently `claude/vigilant-knuth-inx1ud`). Point it at `main` later if you
> promote one.

Or via CLI: `npm i -g vercel && vercel` (interactive) — or non-interactive with
a token: `vercel --prod --yes --token $VERCEL_TOKEN`.

### Fly.io

Next.js needs `output: "standalone"` in `next.config.mjs` plus a `Dockerfile`,
then `fly launch`. Heavier than Vercel; ask and this repo can include the Fly
scaffolding.

---

Built with Next.js (App Router), TypeScript, Tailwind, and the OpenAI API.
