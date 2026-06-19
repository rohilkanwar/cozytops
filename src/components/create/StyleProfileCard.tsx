import type { AnalyzeResponse } from "@/lib/types";

const ENGINE_LABEL: Record<AnalyzeResponse["engine"], string> = {
  "claude-vision": "Analysed with Claude vision",
  "claude-text": "Analysed with Claude",
  heuristic: "Style read · demo engine",
};

function initials(name: string): string {
  const w = name.replace(/[._]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return (w[0]?.slice(0, 2) || "?").toUpperCase();
}

export function StyleProfileCard({ data }: { data: AnalyzeResponse }) {
  const { profile, style, engine, notice } = data;
  const captionById = new Map(profile.posts.map((p) => [p.id, p.caption || p.imageAlt]));
  const pct = Math.round(style.confidence * 100);

  return (
    <div className="card p-6 sm:p-8">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-cozy border border-brass/60 bg-cream font-display text-xl font-semibold text-navy">
          {initials(profile.displayName || profile.handle)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold text-ink">
            {profile.displayName}
          </p>
          <p className="text-sm text-ink/55">@{profile.handle}</p>
        </div>
        <span
          className={`ml-auto chip ${
            profile.source === "demo"
              ? "border-brass/50 text-brass-deep"
              : "border-forest/40 text-forest-deep"
          }`}
        >
          {profile.source === "demo" ? "Demo persona" : "Live profile"}
        </span>
      </div>

      {notice && (
        <p className="mt-5 rounded-cozy border-l-2 border-brass/60 bg-brass/[0.08] px-4 py-2.5 text-sm text-ink/70">
          {notice}
        </p>
      )}

      <div className="mt-7 h-px w-full bg-ink/10" />

      {/* Vibe + confidence */}
      <div className="mt-6">
        <p className="eyebrow">Your vibe</p>
        <h3 className="mt-2 font-display text-4xl font-semibold italic text-burgundy">
          {style.vibeName}
        </h3>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-oat">
            <div className="h-full bg-burgundy" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/55">
            {pct}% read
          </span>
        </div>
      </div>

      <p className="mt-5 leading-relaxed text-ink/75">{style.summary}</p>

      {/* Palette */}
      <div className="mt-7">
        <p className="eyebrow">The palette</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-3">
          {style.palette.map((c) => (
            <div key={c.hex + c.name} className="flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-[2px] border border-ink/15"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} ${c.hex}`}
              />
              <span className="text-xs text-ink/55">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aesthetics */}
      <div className="mt-6 flex flex-wrap gap-2">
        {style.aesthetics.map((a) => (
          <span key={a} className="chip">
            {a}
          </span>
        ))}
      </div>

      {/* Affinities + signature */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="eyebrow">Drawn to</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            {style.garmentAffinities.slice(0, 4).map((g) => (
              <li key={g} className="flex gap-2.5">
                <span className="text-brass">—</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-cozy border-l-2 border-brass/70 bg-burgundy/[0.05] p-4">
          <p className="eyebrow text-burgundy/70">Signature detail</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {style.signatureMotif}
          </p>
        </div>
      </div>

      {/* Evidence */}
      {style.evidence.length > 0 && (
        <details className="group mt-7">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.66rem] font-medium uppercase tracking-luxe text-ink/55 transition hover:text-ink">
            <span className="text-brass transition group-open:rotate-90">›</span>
            Why we think this
          </summary>
          <ul className="mt-3 space-y-2">
            {style.evidence.map((e, idx) => (
              <li key={idx} className="rounded-cozy bg-oat/40 px-3 py-2 text-sm text-ink/70">
                <span className="text-ink/85">{e.observation}</span>
                {captionById.get(e.postId) && (
                  <span className="mt-0.5 block truncate text-xs italic text-ink/45">
                    “{captionById.get(e.postId)}”
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-7 text-right text-[0.58rem] font-medium uppercase tracking-luxe text-ink/35">
        {ENGINE_LABEL[engine]}
      </p>
    </div>
  );
}
