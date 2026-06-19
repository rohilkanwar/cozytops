import { HandleInput } from "./HandleInput";

export function Hero({ mockupSvg }: { mockupSvg: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="knit-texture absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-16">
        <div className="animate-fade-up">
          <span className="chip bg-sage/20 text-sage-deep">
            ✦ AI-styled, human-made
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-cocoa sm:text-5xl lg:text-6xl">
            A top that&apos;s
            <span className="text-terracotta"> unmistakably you.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cocoa/70">
            Drop your public Instagram handle. Cozy Tops reads your colors, your
            textures, the way you put yourself together — then designs a
            one-of-one <strong>sweater</strong>, <strong>tee</strong>, or{" "}
            <strong>jacket</strong> made just for you, and a partner studio
            stitches it up and ships it.
          </p>
          <div className="mt-8 max-w-xl">
            <HandleInput autoFocus />
          </div>
          <p className="mt-4 text-sm text-cocoa/50">
            Public profiles only, with your consent. We read your vibe, not your
            DMs.
          </p>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="card mx-auto max-w-sm overflow-hidden p-3">
            <div
              className="overflow-hidden rounded-[1.4rem]"
              dangerouslySetInnerHTML={{ __html: mockupSvg }}
            />
            <div className="flex items-center justify-between px-3 py-3">
              <div>
                <p className="font-display text-lg font-semibold text-cocoa">
                  The Coastal Heirloom Knit
                </p>
                <p className="text-sm text-cocoa/55">designed from @thesaltyloom</p>
              </div>
              <span className="chip bg-terracotta/15 text-terracotta-deep">1 of 1</span>
            </div>
          </div>
          <div className="absolute -right-3 -top-3 hidden rotate-6 rounded-2xl bg-butter px-4 py-2 font-display text-sm font-semibold text-cocoa shadow-cozy-sm sm:block">
            made for you ♥
          </div>
        </div>
      </div>
    </section>
  );
}
