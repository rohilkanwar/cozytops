"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SAMPLES = ["@thesaltyloom", "@rust.and.denim", "@marmalade.mornings", "@concrete.carbon", "@tangerine.dream"];

export function HandleInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function go(handle: string) {
    const h = handle.trim();
    if (!h) return;
    router.push(`/create?handle=${encodeURIComponent(h)}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-cocoa/40">
            @
          </span>
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="your.instagram"
            aria-label="Instagram handle"
            className="w-full rounded-full border-2 border-cocoa/15 bg-white/90 py-4 pl-10 pr-5 text-lg text-cocoa shadow-cozy-sm outline-none transition placeholder:text-cocoa/35 focus:border-terracotta"
          />
        </div>
        <button type="submit" className="btn-primary text-lg">
          Design my top →
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-cocoa/50">Try a sample:</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="chip transition hover:bg-terracotta/15 hover:text-terracotta-deep"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
