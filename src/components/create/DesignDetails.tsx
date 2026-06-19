import type { DesignBrief } from "@/lib/types";

const PATTERN_LABEL: Record<DesignBrief["pattern"], string> = {
  solid: "Solid",
  stripes: "Stripes",
  fairisle: "Fair-isle yoke",
  colorblock: "Color-blocked",
  speckle: "Heathered speckle",
  gradient: "Gradient",
};

export function DesignDetails({
  design,
  engine,
}: {
  design: DesignBrief;
  engine: "claude" | "heuristic";
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-bold text-cocoa">{design.title}</h3>
        <span className="chip shrink-0 bg-terracotta/15 text-terracotta-deep">1 of 1</span>
      </div>

      <p className="mt-2 leading-relaxed text-cocoa/75">{design.story}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip">{PATTERN_LABEL[design.pattern]}</span>
        {design.motifs.slice(0, 3).map((m) => (
          <span key={m} className="chip">
            {m}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {design.palette.map((c) => (
          <span
            key={c.hex + c.name}
            className="h-6 w-6 rounded-full border border-cocoa/10"
            style={{ backgroundColor: c.hex }}
            title={`${c.name} ${c.hex}`}
          />
        ))}
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-cocoa/45">Material</dt>
          <dd className="text-cocoa/75">{design.materials}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-cocoa/45">Detail</dt>
          <dd className="text-cocoa/75">{design.placementNotes}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-cocoa/40">
        {engine === "claude" ? "Designed with Claude" : "Designed · demo engine"}
      </p>
    </div>
  );
}
