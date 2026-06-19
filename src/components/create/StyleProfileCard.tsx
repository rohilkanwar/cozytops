import type { AnalyzeResponse } from "@/lib/types";

const ENGINE_LABEL: Record<AnalyzeResponse["engine"], string> = {
  "claude-vision": "Analyzed with Claude vision",
  "claude-text": "Analyzed with Claude",
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
    <div className="card p-6 sm:p-7">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/25 font-display text-xl font-bold text-sage-deep">
          {initials(profile.displayName || profile.handle)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-cocoa">
            {profile.displayName}
          </p>
          <p className="text-sm text-cocoa/55">@{profile.handle}</p>
        </div>
        <span
          className={`ml-auto chip ${
            profile.source === "demo"
              ? "bg-butter/40 text-cocoa/70"
              : "bg-sage/20 text-sage-deep"
          }`}
        >
          {profile.source === "demo" ? "Demo persona" : "Live profile"}
        </span>
      </div>

      {notice && (
        <p className="mt-4 rounded-2xl bg-butter/25 px-4 py-2 text-sm text-cocoa/70">
          {notice}
        </p>
      )}

      {/* Vibe + confidence */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/45">
          Your vibe
        </p>
        <h3 className="mt-1 font-display text-3xl font-bold text-terracotta-deep">
          {style.vibeName}
        </h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-oat">
            <div
              className="h-full rounded-full bg-sage"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-cocoa/60">{pct}% read</span>
        </div>
      </div>

      <p className="mt-4 leading-relaxed text-cocoa/75">{style.summary}</p>

      {/* Palette */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/45">
          Your palette
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {style.palette.map((c) => (
            <div key={c.hex + c.name} className="flex items-center gap-2">
              <span
                className="h-8 w-8 rounded-full border border-cocoa/10 shadow-inner"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} ${c.hex}`}
              />
              <span className="text-xs text-cocoa/55">{c.name}</span>
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/45">
            Drawn to
          </p>
          <ul className="mt-2 space-y-1 text-sm text-cocoa/75">
            {style.garmentAffinities.slice(0, 4).map((g) => (
              <li key={g} className="flex gap-2">
                <span className="text-terracotta">·</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-terracotta/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-deep/70">
            Signature detail
          </p>
          <p className="mt-1 text-sm font-medium text-cocoa/80">
            {style.signatureMotif}
          </p>
        </div>
      </div>

      {/* Evidence */}
      {style.evidence.length > 0 && (
        <details className="mt-6 group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-cocoa/60 hover:text-cocoa">
            <span className="group-open:hidden">▸ Why we think this</span>
            <span className="hidden group-open:inline">▾ Why we think this</span>
          </summary>
          <ul className="mt-3 space-y-2">
            {style.evidence.map((e, idx) => (
              <li key={idx} className="rounded-xl bg-oat/50 px-3 py-2 text-sm text-cocoa/70">
                <span className="text-cocoa/85">{e.observation}</span>
                {captionById.get(e.postId) && (
                  <span className="mt-0.5 block truncate text-xs italic text-cocoa/45">
                    “{captionById.get(e.postId)}”
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-6 text-right text-xs text-cocoa/40">{ENGINE_LABEL[engine]}</p>
    </div>
  );
}
