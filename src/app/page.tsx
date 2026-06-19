import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { HandleInput } from "@/components/HandleInput";
import { renderMockup } from "@/lib/design/mockup";
import type { DesignBrief } from "@/lib/types";

// Server-rendered example mockups so the landing page shows real output.
const HERO_BRIEF: DesignBrief = {
  garment: "sweater",
  title: "The Coastal Heirloom Knit",
  story: "",
  palette: [],
  primaryColor: "#E7DAC4",
  secondaryColor: "#A9C2B5",
  accentColor: "#6E7A7C",
  pattern: "fairisle",
  motifs: [],
  monogram: "SL",
  placementNotes: "",
  materials: "",
  careVibe: "",
};

const SHOWCASE: { brief: DesignBrief; label: string; from: string }[] = [
  {
    label: "The Crew Knit",
    from: "warm, earthy, hand-made energy",
    brief: { ...HERO_BRIEF, pattern: "fairisle" },
  },
  {
    label: "The Heavyweight Tee",
    from: "monochrome, utility, city-paced",
    brief: {
      ...HERO_BRIEF,
      garment: "tee",
      primaryColor: "#2E3033",
      secondaryColor: "#4C5258",
      accentColor: "#ECEEF0",
      pattern: "solid",
      monogram: "CC",
    },
  },
  {
    label: "The Chore Jacket",
    from: "thrifted, worn-in, vinyl-crate vibes",
    brief: {
      ...HERO_BRIEF,
      garment: "jacket",
      primaryColor: "#4A5A73",
      secondaryColor: "#A8552F",
      accentColor: "#E8E2D5",
      pattern: "speckle",
      monogram: "RD",
    },
  },
];

export default function HomePage() {
  const heroSvg = renderMockup(HERO_BRIEF);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link
              href="#how"
              className="hidden text-[0.72rem] font-medium uppercase tracking-luxe text-ink/60 transition hover:text-ink sm:inline-flex"
            >
              The Process
            </Link>
            <Link href="#start" className="btn-primary">
              Begin
            </Link>
          </nav>
        </div>
      </header>

      <Hero mockupSvg={heroSvg} />

      {/* The collection */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="eyebrow">The Collection</p>
          <div className="mx-auto mt-3 h-px w-12 bg-brass/70" />
          <h2 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
            One vibe, three canvases
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink/65">
            Every design is drawn from <em>your</em> style — then tailored onto
            the piece you choose to wear.
          </p>
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {SHOWCASE.map((s) => (
            <figure key={s.label} className="card overflow-hidden p-3">
              <div
                className="overflow-hidden rounded-cozy bg-cream"
                dangerouslySetInnerHTML={{ __html: renderMockup(s.brief) }}
              />
              <figcaption className="px-3 py-4 text-center">
                <p className="font-display text-xl font-semibold text-ink">{s.label}</p>
                <p className="mt-1 text-sm italic text-ink/55">for the {s.from}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div id="how">
        <HowItWorks />
      </div>

      {/* Invitation */}
      <section id="start" className="mx-auto max-w-4xl px-6 py-20">
        <div className="card weave-texture relative overflow-hidden p-9 text-center sm:p-14">
          <div className="relative">
            <p className="eyebrow">Your Commission Awaits</p>
            <div className="mx-auto mt-3 h-px w-12 bg-brass/70" />
            <h2 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
              Begin your one-of-one
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/70">
              It takes about a minute. No account, and no checkout until the
              design is one you love.
            </p>
            <div className="mx-auto mt-8 max-w-xl text-left">
              <HandleInput />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
