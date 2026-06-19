"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Opening @HANDLE's feed…",
  "Looking at the photos, not just the captions…",
  "Reading the color story…",
  "Noticing textures and silhouettes…",
  "Spotting the garments you gravitate to…",
  "Finding the one detail that's so you…",
  "Sketching your one-of-one piece…",
];

export function AnalyzingView({ handle }: { handle: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-oat border-t-terracotta" />
        <span className="absolute inset-2 animate-pulse-soft rounded-full bg-terracotta/10" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🧶</span>
      </div>
      <p className="mt-8 font-display text-2xl font-semibold text-cocoa">
        Reading your style
      </p>
      <p className="mt-2 h-6 text-cocoa/60 transition-all">
        {MESSAGES[i].replace("@HANDLE", `@${handle}`)}
      </p>
      <div className="mt-6 flex gap-1.5">
        {MESSAGES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx <= i ? "w-6 bg-terracotta" : "w-1.5 bg-oat"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
