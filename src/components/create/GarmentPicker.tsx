"use client";

import type { GarmentType } from "@/lib/types";
import { GARMENTS } from "../garmentMeta";

function GarmentIcon({ type }: { type: GarmentType }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "tee") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
        <path
          {...common}
          d="M8.5 3.5 4 6.5 6 9.5 8.5 8.2V20.5H15.5V8.2L18 9.5 20 6.5 15.5 3.5C14 5.4 10 5.4 8.5 3.5Z"
        />
      </svg>
    );
  }
  if (type === "jacket") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
        <path
          {...common}
          d="M8 4 4 6.5 5.6 10 7.5 9V20.5H16.5V9L18.4 10 20 6.5 16 4 12 7.2Z"
        />
        <path {...common} d="M12 7.2V20.5" />
      </svg>
    );
  }
  // sweater — longer sleeves + ribbed crew collar
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <path
        {...common}
        d="M8.4 3.8 3.5 7 5.4 11 8.2 9.6V20.5H15.8V9.6L18.6 11 20.5 7 15.6 3.8C14 5.8 10 5.8 8.4 3.8Z"
      />
      <path {...common} d="M9 4.3C10.4 5.7 13.6 5.7 15 4.3" />
    </svg>
  );
}

export function GarmentPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: GarmentType;
  onSelect: (g: GarmentType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {GARMENTS.map((g) => {
        const active = g.type === selected;
        return (
          <button
            key={g.type}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(g.type)}
            className={`flex flex-col items-center gap-2 rounded-cozy border p-4 text-center transition disabled:cursor-not-allowed ${
              active
                ? "border-burgundy bg-burgundy/[0.06] text-burgundy shadow-cozy-sm"
                : "border-ink/12 bg-cream/40 text-ink/70 hover:border-ink/30"
            }`}
          >
            <GarmentIcon type={g.type} />
            <span
              className={`font-display text-base font-semibold ${
                active ? "text-burgundy" : "text-ink"
              }`}
            >
              {g.name.replace(/^Custom /, "")}
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">
              ${g.priceUsd}
            </span>
          </button>
        );
      })}
    </div>
  );
}
