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
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-ink/40">
            @
          </span>
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="your.instagram"
            aria-label="Instagram handle"
            className="w-full rounded-cozy border border-ink/20 bg-parchment py-4 pl-10 pr-5 text-lg text-ink shadow-cozy-sm outline-none transition placeholder:text-ink/35 focus:border-burgundy"
          />
        </div>
        <button type="submit" className="btn-primary">
          Design My Piece
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">
          Or try one of ours
        </span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-cozy border border-ink/15 px-3 py-1 text-xs text-ink/65 transition hover:border-burgundy hover:text-burgundy"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
