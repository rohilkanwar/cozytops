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
    label: "The Custom Crew Knit",
    from: "warm, earthy, hand-made energy",
    brief: { ...HERO_BRIEF, pattern: "fairisle" },
  },
  {
    label: "The Custom Heavyweight Tee",
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
    label: "The Custom Chore Jacket",
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
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="#how" className="btn-ghost hidden sm:inline-flex">
              How it works
            </Link>
            <Link href="#start" className="btn-primary">
              Start
            </Link>
          </nav>
        </div>
      </header>

      <Hero mockupSvg={heroSvg} />

      {/* Three ways showcase */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <span className="chip bg-terracotta/15 text-terracotta-deep">Three ways to wear it</span>
          <h2 className="mt-4 text-3xl font-bold text-cocoa sm:text-4xl">
            One vibe, your choice of canvas
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-cocoa/65">
            Every design is generated from <em>your</em> style — then rendered
            onto the piece you want to wear.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SHOWCASE.map((s) => (
            <div key={s.label} className="card overflow-hidden p-3">
              <div
                className="overflow-hidden rounded-[1.4rem] bg-cream"
                dangerouslySetInnerHTML={{ __html: renderMockup(s.brief) }}
              />
              <div className="px-3 py-3">
                <p className="font-display text-lg font-semibold text-cocoa">{s.label}</p>
                <p className="text-sm text-cocoa/55">for {s.from}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div id="how">
        <HowItWorks />
      </div>

      {/* Final CTA */}
      <section id="start" className="mx-auto max-w-4xl px-6 py-16">
        <div className="card knit-texture relative overflow-hidden p-8 sm:p-12">
          <div className="relative">
            <h2 className="text-3xl font-bold text-cocoa sm:text-4xl">
              Ready to meet your top?
            </h2>
            <p className="mt-3 max-w-xl text-cocoa/70">
              It takes about a minute. No account, no checkout until you love the
              design.
            </p>
            <div className="mt-7 max-w-xl">
              <HandleInput />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
