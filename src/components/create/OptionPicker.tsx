"use client";

import type { DesignBrief, GarmentImage } from "@/lib/types";

// Four distinct design directions for the chosen garment. Every thumbnail is a
// real generated photograph — while an option's first photo renders, its card
// shows a shimmer, never a placeholder design.
export function OptionPicker({
  options,
  selected,
  thumbs,
  rendering,
  onSelect,
}: {
  options: DesignBrief[];
  selected: number;
  /** First finished photo per option (undefined while rendering). */
  thumbs: (GarmentImage | undefined)[];
  /** True while an option has no photo yet. */
  rendering: boolean[];
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt, i) => {
        const active = i === selected;
        const thumb = thumbs[i];
        return (
          <button
            key={opt.title + i}
            type="button"
            onClick={() => onSelect(i)}
            className={`group overflow-hidden rounded-cozy border text-left transition ${
              active
                ? "border-burgundy ring-1 ring-burgundy/30"
                : "border-ink/12 hover:border-ink/35"
            }`}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-oat/40">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb.src}
                  alt={thumb.alt}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : rendering[i] ? (
                <div className="h-full w-full animate-pulse-soft bg-oat" aria-label="rendering" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-[0.55rem] font-medium uppercase tracking-luxe text-ink/35">
                    Preview pending
                  </span>
                </div>
              )}
            </div>
            <div className="px-2.5 py-2.5">
              <p className="truncate text-xs font-medium text-ink" title={opt.title}>
                {opt.title}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                {opt.palette.slice(0, 4).map((c) => (
                  <span
                    key={c.hex + c.name}
                    className="h-2.5 w-2.5 rounded-[2px] border border-ink/15"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
