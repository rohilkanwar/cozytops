"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SAMPLES = ["@thesaltyloom", "@rust.and.denim", "@marmalade.mornings", "@concrete.carbon", "@tangerine.dream"];

export function HandleInput({
  autoFocus = false,
  connectEnabled = false,
}: {
  autoFocus?: boolean;
  connectEnabled?: boolean;
}) {
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

      <p className="mt-2 text-xs text-ink/45">Public profiles only.</p>

      {connectEnabled && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/40">
              Private account?
            </span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          <a
            href="/api/auth/instagram/login"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-cozy border border-ink/20 bg-parchment py-3.5 text-sm font-medium text-ink shadow-cozy-sm transition hover:border-burgundy hover:text-burgundy"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
              <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.24A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.88A4.28 4.28 0 1 1 16.28 12 4.28 4.28 0 0 1 12 16.28Zm6.85-11.14a1.54 1.54 0 1 0 1.54 1.54 1.54 1.54 0 0 0-1.54-1.54Z" />
            </svg>
            Connect your Instagram
          </a>
          <p className="mt-2 text-center text-xs text-ink/45">
            We read only your posts to design your piece, then forget the connection.
          </p>
        </div>
      )}

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
