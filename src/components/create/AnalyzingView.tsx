"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Opening @HANDLE's feed…",
  "Studying the photographs, not just the captions…",
  "Reading the colour story…",
  "Noting textures and silhouettes…",
  "Tracing the garments you gravitate toward…",
  "Finding the one detail that is unmistakably you…",
  "Sketching your one-of-one piece…",
];

export function AnalyzingView({ handle }: { handle: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-spin rounded-full border border-oat border-t-burgundy" />
        <span className="absolute inset-[3px] rounded-full border border-brass/40" />
        <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold tracking-tight text-navy">
          CT
        </span>
      </div>
      <p className="mt-8 eyebrow">The Atelier</p>
      <p className="mt-3 font-display text-3xl font-semibold text-ink">
        Reading your style
      </p>
      <p className="mt-3 h-6 text-ink/60">
        {MESSAGES[i].replace("@HANDLE", `@${handle}`)}
      </p>
      <div className="mt-7 flex gap-1.5">
        {MESSAGES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx <= i ? "w-6 bg-burgundy" : "w-1.5 bg-oat"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
