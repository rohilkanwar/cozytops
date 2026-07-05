"use client";

import type { ShopResponse } from "@/lib/types";

// Style-matched picks from real retailers, deep-linked through our affiliate
// credentials. rel="sponsored" marks paid outbound links; the disclosure line
// renders whenever monetization is active.
export function ShopTheVibe({
  shop,
  loading,
  error,
  onRetry,
}: {
  shop?: ShopResponse;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  if (!shop && !loading && !error) return null;

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Shop the vibe</p>
        {shop?.monetized && (
          <p className="text-[0.55rem] uppercase tracking-luxe text-ink/35">
            Links may earn us a commission
          </p>
        )}
      </div>
      <p className="mt-2 text-sm text-ink/60">
        Pieces like yours, out in the wild — matched to your style read.
      </p>

      {loading && (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse-soft rounded-cozy border border-ink/10 bg-oat"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 rounded-cozy border-l-2 border-burgundy/40 bg-burgundy/[0.04] px-4 py-3">
          <p className="text-xs leading-relaxed text-burgundy">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-[0.62rem] font-medium uppercase tracking-luxe text-burgundy underline underline-offset-2 hover:text-burgundy-deep"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {shop && !loading && (
        <ul className="mt-4 divide-y divide-ink/8">
          {shop.recommendations.map((rec) => (
            <li key={rec.url}>
              <a
                href={rec.url}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="group flex items-center gap-4 py-3 transition"
              >
                <span className="w-20 shrink-0 rounded-cozy border border-ink/12 px-2 py-1 text-center text-[0.55rem] font-medium uppercase tracking-luxe text-ink/55">
                  {rec.merchantLabel}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink transition group-hover:text-burgundy">
                    {rec.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink/55">
                    {rec.why}
                  </span>
                </span>
                <span className="shrink-0 text-[0.62rem] font-medium text-ink/45">
                  {rec.priceBand}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-brass transition group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
