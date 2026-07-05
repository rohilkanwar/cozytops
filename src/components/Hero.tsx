import { HandleInput } from "./HandleInput";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="weave-texture absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brass/70" />
            <span className="eyebrow">Bespoke · Made to Order</span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
            A wardrobe piece,
            <span className="block italic text-burgundy">unmistakably yours.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
            Share a public Instagram handle. Cozy Tops reads your colours, your
            textures, the way you compose yourself — then designs a one-of-one{" "}
            <strong className="font-medium">sweater</strong>,{" "}
            <strong className="font-medium">tee</strong>, or{" "}
            <strong className="font-medium">jacket</strong>, which a partner
            atelier cuts, stitches, and ships to your door.
          </p>
          <div className="mt-8 max-w-xl">
            <HandleInput autoFocus />
          </div>
          <p className="mt-4 text-sm text-ink/50">
            Public profiles only, with your consent. We read your vibe, not your
            DMs.
          </p>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="card mx-auto max-w-sm overflow-hidden p-3">
            <div className="overflow-hidden rounded-cozy bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/hero.jpg"
                alt="Model in a cream Fair-Isle crewneck knit with sage and slate-blue yoke, photographed on a coastal shore"
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </div>
            <div className="px-3 py-4 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                The Coastal Heirloom Knit
              </p>
              <p className="mt-1 text-sm italic text-ink/55">
                designed from @thesaltyloom
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 hidden h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border border-brass/70 bg-cream text-center shadow-cozy-sm sm:flex">
            <span className="font-display text-lg font-semibold leading-none text-burgundy">
              1/1
            </span>
            <span className="mt-1 text-[0.5rem] font-medium uppercase tracking-crest text-ink/50">
              One of One
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
