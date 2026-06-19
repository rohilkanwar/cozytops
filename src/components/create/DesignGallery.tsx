"use client";

import { useState } from "react";
import type { GarmentImage } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  product: "Product",
  model: "On model",
};

export function DesignGallery({
  svg,
  images,
  pending,
  unavailable,
  designing,
}: {
  svg: string;
  images: GarmentImage[];
  pending: number;
  unavailable: boolean;
  designing: boolean;
}) {
  // Selected slide key: "img-<i>" for a photo, or "svg" for the schematic.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? (images.length > 0 ? "img-0" : "svg");

  const selImageIdx = selected.startsWith("img-")
    ? Number(selected.slice(4))
    : -1;
  const selImage = selImageIdx >= 0 ? images[selImageIdx] : undefined;

  const waitingForFirstPhoto =
    !unavailable && images.length === 0 && pending > 0;

  return (
    <div className="rounded-cozy border border-cocoa/10 bg-cream shadow-cozy-sm">
      {/* Main viewer */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-cozy bg-oat/30">
        {selImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selImage.src}
            alt={selImage.alt}
            className="h-full w-full object-contain"
          />
        ) : svg ? (
          <div
            className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-cocoa/20">
            🧶
          </div>
        )}

        {(waitingForFirstPhoto || (designing && !svg)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream/70 backdrop-blur-sm">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-oat border-t-terracotta" />
            <span className="font-display text-lg font-semibold text-cocoa/70">
              {designing && !svg
                ? "Designing your piece…"
                : "Rendering photorealistic shots…"}
            </span>
            <span className="text-xs text-cocoa/50">this takes a few seconds</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto p-3">
        {images.map((img, i) => {
          const key = `img-${i}`;
          return (
            <Thumb
              key={key}
              active={selected === key}
              onClick={() => setPicked(key)}
              label={KIND_LABEL[img.kind] ?? "Photo"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </Thumb>
          );
        })}

        {Array.from({ length: pending }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="h-16 w-16 shrink-0 animate-pulse-soft rounded-xl bg-oat"
            aria-label="rendering"
          />
        ))}

        {svg && (
          <Thumb
            active={selected === "svg"}
            onClick={() => setPicked("svg")}
            label="Schematic"
          >
            <div
              className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </Thumb>
        )}
      </div>

      {unavailable && (
        <p className="px-4 pb-3 text-center text-xs text-cocoa/40">
          Showing the design schematic. Add an image key to generate
          photorealistic previews.
        </p>
      )}
    </div>
  );
}

function Thumb({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-cream transition ${
        active ? "border-terracotta" : "border-cocoa/10 hover:border-cocoa/30"
      }`}
    >
      {children}
    </button>
  );
}
