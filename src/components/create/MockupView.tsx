"use client";

export function MockupView({
  svg,
  designing,
}: {
  svg: string | null;
  designing: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-cozy border border-cocoa/10 bg-cream shadow-cozy-sm">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex aspect-[480/560] items-center justify-center text-cocoa/30">
          <span className="text-5xl">🧶</span>
        </div>
      )}
      {designing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream/70 backdrop-blur-sm">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-oat border-t-terracotta" />
          <span className="font-display text-lg font-semibold text-cocoa/70">
            Re-stitching your design…
          </span>
        </div>
      )}
    </div>
  );
}
