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

// Photography-only gallery: real generated shots of the selected design.
// While the full set renders, the option's preview photo stands in (with a
// progress pill); with no preview yet, a loading state — never a placeholder
// design.
export function DesignGallery({
  images,
  preview,
  pending,
  designing,
  error,
  onRetry,
}: {
  images: GarmentImage[];
  /** The option's cheap preview shot, shown while the full set renders. */
  preview?: GarmentImage;
  pending: number;
  designing: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const selIdx = picked !== null && picked < images.length ? picked : 0;
  const selImage = images[selIdx] ?? (images.length === 0 ? preview : undefined);

  const waitingForFirstPhoto = images.length === 0 && pending > 0;
  const caption =
    images.length > 0 && images[selIdx]
      ? `${KIND_LABEL[images[selIdx].kind] ?? "Photograph"} · ${selIdx + 1}/${images.length + pending}`
      : "";

  return (
    <div className="card overflow-hidden">
      {/* Main viewer */}
      <div className="relative aspect-[4/5] overflow-hidden border-b border-ink/10 bg-oat/25">
        {selImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selImage.src} alt={selImage.alt} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CrestMark />
          </div>
        )}

        {(waitingForFirstPhoto || designing) && !selImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cream/75 backdrop-blur-sm">
            <span className="relative h-12 w-12">
              <span className="absolute inset-0 animate-spin rounded-full border border-oat border-t-burgundy" />
              <span className="absolute inset-[3px] rounded-full border border-brass/40" />
            </span>
            <span className="eyebrow text-ink/60">
              {designing ? "Designing your piece" : "Rendering the photographs"}
            </span>
            <span className="text-xs text-ink/45">
              {designing ? "this takes a few moments" : "about a minute or two"}
            </span>
          </div>
        )}

        {waitingForFirstPhoto && selImage && (
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-cozy bg-cream/90 px-3.5 py-1.5 text-[0.58rem] font-medium uppercase tracking-luxe text-ink/65 shadow-cozy-sm backdrop-blur">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border border-oat border-t-burgundy" />
            Finishing the full shoot
          </span>
        )}

        {caption && (
          <span className="absolute left-4 top-4 rounded-cozy bg-cream/85 px-3 py-1 text-[0.58rem] font-medium uppercase tracking-luxe text-ink/60 backdrop-blur">
            {caption}
          </span>
        )}
      </div>

      {/* Thumbnails: finished photos + a skeleton per still-rendering shot */}
      {(images.length > 0 || pending > 0) && (
        <div className="flex items-center gap-2.5 overflow-x-auto p-4">
          {images.map((img, i) => (
            <button
              key={`img-${i}`}
              type="button"
              onClick={() => setPicked(i)}
              title={KIND_LABEL[img.kind] ?? "Photo"}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-cozy border bg-cream transition ${
                selIdx === i
                  ? "border-burgundy ring-1 ring-burgundy/30"
                  : "border-ink/12 hover:border-ink/35"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </button>
          ))}

          {Array.from({ length: pending }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-16 w-16 shrink-0 animate-pulse-soft rounded-cozy border border-ink/10 bg-oat"
              aria-label="rendering"
            />
          ))}
        </div>
      )}

      {error && images.length === 0 && (
        <div className="border-t border-burgundy/20 bg-burgundy/[0.04] px-4 py-3">
          <p className="text-xs leading-relaxed text-burgundy">
            <span className="font-medium">Photography unavailable.</span> {error}
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
    </div>
  );
}
