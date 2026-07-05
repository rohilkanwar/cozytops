import type { DesignBrief } from "@/lib/types";

const PATTERN_LABEL: Record<DesignBrief["pattern"], string> = {
  solid: "Solid",
  stripes: "Stripes",
  fairisle: "Fair-isle yoke",
  colorblock: "Colour-blocked",
  speckle: "Heathered speckle",
  gradient: "Gradient",
};

export function DesignDetails({
  design,
  engine,
}: {
  design: DesignBrief;
  engine: "openai";
}) {
  return (
    <div>
      <p className="eyebrow">The Design</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h3 className="font-display text-3xl font-semibold leading-tight text-ink">
          {design.title}
        </h3>
        <span className="mt-1 shrink-0 rounded-cozy border border-brass/60 px-2.5 py-1 font-display text-sm font-semibold text-burgundy">
          1 / 1
        </span>
      </div>

      <p className="mt-3 leading-relaxed text-ink/75">{design.story}</p>

      <div className="mt-5 flex flex-wrap gap-2">
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
            className="h-6 w-6 rounded-[2px] border border-ink/15"
            style={{ backgroundColor: c.hex }}
            title={`${c.name} ${c.hex}`}
          />
        ))}
      </div>

      <dl className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">
            Material
          </dt>
          <dd className="text-ink/75">{design.materials}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">
            Detail
          </dt>
          <dd className="text-ink/75">{design.placementNotes}</dd>
        </div>
      </dl>

      <p className="mt-5 text-[0.58rem] font-medium uppercase tracking-luxe text-ink/35">
        {engine === "openai" ? "Designed with GPT" : engine}
      </p>
    </div>
  );
}
