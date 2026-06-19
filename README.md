# Cozy Tops 🧶

**A one-of-one top, designed from your vibe.**

Drop a public Instagram handle and Cozy Tops reads your personal style — your
colors, textures, the garments you gravitate to, the way you put yourself
together — then designs a custom **sweater**, **tee**, or **jacket** made just
for you, complete with a *personification* detail pulled straight from who you
are. Approve it, and a partner studio handles manufacturing and shipping.

This repo is the **customer-facing experience**. It runs end-to-end today in a
self-contained **demo mode** (no scraping, no credentials), with clean seams to
drop in real data + fulfillment partners when you're ready to go live.

---

## The experience

```
Instagram handle ─▶ Style read ─▶ Custom design ─▶ Mockup ─▶ Order
   (provider)        (Claude /      (Claude /        (SVG)     (Printful /
                      heuristic)     heuristic)                 Shopify / demo)
```

1. **Share a handle** on the landing page.
2. **`/api/analyze`** resolves the profile and runs the style analyzer:
   multimodal reasoning with Claude over the photos + captions when an API key
   is present, or a deterministic lexicon-based read otherwise. Returns a
   structured `StyleProfile` (vibe name, palette, aesthetics, garment
   affinities, motifs, a signature detail, and explainable evidence).
3. **`/api/design`** turns that profile + a chosen garment into a manufacturable
   `DesignBrief` (named piece, color story, pattern, monogram, personification
   story) and renders an SVG mockup.
4. **`/api/checkout`** hands the design + size to a fulfillment provider.

## Why it works with zero setup

Every external dependency is behind an interface with a graceful fallback, so
the whole flow is demo-able immediately and degrades gracefully in production:

| Capability | With no config (default) | With config |
|---|---|---|
| Instagram data | Curated demo personas — any handle deterministically resolves to a rich sample persona | `INSTAGRAM_PROVIDER=graph` (Instagram Login, the visitor's own account) or `apify` (a licensed data vendor) |
| Style analysis | Deterministic lexicon analyzer | Claude multimodal (`ANTHROPIC_API_KEY`) — true vision when post images are available |
| Garment design | Deterministic design generator | Claude-authored design brief |
| Mockup | Procedural SVG (always) | (seam to swap in an image-generation model) |
| Fulfillment | Simulated, clearly-labeled order | `FULFILLMENT_PROVIDER=printful` or `shopify` |

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

Add an `ANTHROPIC_API_KEY` to `.env.local` to switch the analyzer + designer
from the heuristic engine to Claude.

```bash
npm run build && npm start   # production build
npm run typecheck            # types
npm run lint                 # lint
```

## Project structure

```
src/
  app/
    page.tsx                 Landing page (server-rendered example mockups)
    create/page.tsx          The experience (reads ?handle=)
    api/
      analyze/route.ts       handle  -> InstagramProfile + StyleProfile
      design/route.ts        style   -> DesignBrief + SVG mockup
      checkout/route.ts      design  -> OrderConfirmation
  components/
    create/                  The end-to-end client experience + sub-views
    Hero, HowItWorks, ...    Landing-page sections
  lib/
    instagram/               Provider interface, demo personas, graph/apify
    analysis/                Lexicon, heuristic analyzer, Claude vision analyzer
    design/                  Design generator (Claude + heuristic), SVG mockup
    fulfillment/             Catalog + order orchestration (demo/printful/shopify)
    anthropic.ts, config.ts, types.ts
```

## Extending it

- **Real style vision:** set `ANTHROPIC_API_KEY`. When posts carry image URLs
  (real provider), the analyzer fetches and sends them to Claude as image
  blocks for genuine visual analysis.
- **New garments:** add to `CATALOG` (`lib/fulfillment`), `GARMENTS`
  (`components/garmentMeta.ts`), and a silhouette in `lib/design/mockup.ts`.
- **Image-gen mockups:** swap `renderMockup()` for a call to an
  image-generation model; the call site and types stay the same.

## Deploy

The app is a standard Next.js project and needs **no environment variables to
run** (demo mode). Add `ANTHROPIC_API_KEY` later to switch on the Claude path.

### Vercel (recommended)

Zero-config — Vercel detects Next.js automatically.

1. Push to GitHub (already done).
2. At [vercel.com/new](https://vercel.com/new), **Import** the `cozytops` repo.
3. Framework preset auto-detects **Next.js**; leave build/output settings at
   defaults. (Optional: add `ANTHROPIC_API_KEY` under *Environment Variables*.)
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

Built with Next.js (App Router), TypeScript, Tailwind, and the Anthropic SDK.
