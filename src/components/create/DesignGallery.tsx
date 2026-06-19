"use client";

import { useState } from "react";
import type { GarmentImage } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  product: "Product",
  model: "On model",
};

function CrestMark() {
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center opacity-40">
      <svg viewBox="0 0 40 40" className="h-12 w-12" aria-hidden="true">
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="#16293F" strokeWidth="1" />
        <circle cx="20" cy="20" r="14.5" fill="none" stroke="#A98B4E" strokeWidth="0.8" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-navy">
        CT
      </span>
    </span>
  );
}

export function DesignGallery({
  svg,
  images,
  pending,
  unavailable,
  designing,
  error,
  onRetry,
}: {
  svg: string;
  images: GarmentImage[];
  pending: number;
  unavailable: boolean;
  designing: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  // Selected slide key: "img-<i>" for a photo, or "svg" for the schematic.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? (images.length > 0 ? "img-0" : "svg");

  const selImageIdx = selected.startsWith("img-") ? Number(selected.slice(4)) : -1;
  const selImage = selImageIdx >= 0 ? images[selImageIdx] : undefined;

  const waitingForFirstPhoto = !unavailable && images.length === 0 && pending > 0;
  const caption = selImage ? KIND_LABEL[selImage.kind] ?? "Photograph" : "Schematic";

  return (
    <div className="card overflow-hidden">
      {/* Main viewer */}
      <div className="relative aspect-[4/5] overflow-hidden border-b border-ink/10 bg-oat/25">
        {selImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selImage.src} alt={selImage.alt} className="h-full w-full object-contain" />
        ) : svg ? (
          <div
            className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CrestMark />
          </div>
        )}

        {(waitingForFirstPhoto || (designing && !svg)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cream/75 backdrop-blur-sm">
            <span className="relative h-12 w-12">
              <span className="absolute inset-0 animate-spin rounded-full border border-oat border-t-burgundy" />
              <span className="absolute inset-[3px] rounded-full border border-brass/40" />
            </span>
            <span className="eyebrow text-ink/60">
              {designing && !svg ? "Designing your piece" : "Rendering the photographs"}
            </span>
            <span className="text-xs text-ink/45">this takes a few moments</span>
          </div>
        )}

        {/* Shot caption */}
        <span className="absolute left-4 top-4 rounded-cozy bg-cream/85 px-3 py-1 text-[0.58rem] font-medium uppercase tracking-luxe text-ink/60 backdrop-blur">
          {caption} · 1/1
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2.5 overflow-x-auto p-4">
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
            className="h-16 w-16 shrink-0 animate-pulse-soft rounded-cozy border border-ink/10 bg-oat"
            aria-label="rendering"
          />
        ))}

        {svg && (
          <Thumb active={selected === "svg"} onClick={() => setPicked("svg")} label="Schematic">
            <div
              className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </Thumb>
        )}
      </div>

      {error && images.length === 0 && (
        <div className="border-t border-burgundy/20 bg-burgundy/[0.04] px-4 py-3">
          <p className="text-xs leading-relaxed text-burgundy">
            <span className="font-medium">Photorealistic preview unavailable.</span>{" "}
            {error}
          </p>
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

      {unavailable && (
        <p className="px-4 pb-4 text-center text-xs text-ink/40">
          Showing the design schematic — add an image key for photorealistic previews.
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
      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-cozy border bg-cream transition ${
        active ? "border-burgundy ring-1 ring-burgundy/30" : "border-ink/12 hover:border-ink/35"
      }`}
    >
      {children}
    </button>
  );
}
