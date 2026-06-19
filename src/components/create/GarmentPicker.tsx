"use client";

import type { GarmentType } from "@/lib/types";
import { GARMENTS } from "../garmentMeta";

const ICON: Record<GarmentType, string> = {
  sweater: "🧶",
  tee: "👕",
  jacket: "🧥",
};

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
            className={`flex flex-col items-center gap-1 rounded-cozy border-2 p-4 text-center transition disabled:cursor-not-allowed ${
              active
                ? "border-terracotta bg-terracotta/10 shadow-cozy-sm"
                : "border-cocoa/10 bg-white/70 hover:border-cocoa/25"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {ICON[g.type]}
            </span>
            <span className="text-sm font-semibold text-cocoa">{g.name}</span>
            <span className="text-xs text-cocoa/50">${g.priceUsd}</span>
          </button>
        );
      })}
    </div>
  );
}
