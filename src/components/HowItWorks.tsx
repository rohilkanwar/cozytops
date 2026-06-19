const STEPS = [
  {
    n: "I",
    title: "Share your handle",
    body: "Offer a public Instagram handle. That is the only input the atelier requires.",
  },
  {
    n: "II",
    title: "We read your style",
    body: "Vision models study your photographs and captions — palette, texture, and the garments you gravitate toward.",
  },
  {
    n: "III",
    title: "We design your piece",
    body: "A bespoke sweater, tee, or jacket, finished with a signature detail drawn from who you are.",
  },
  {
    n: "IV",
    title: "Made & delivered",
    body: "Approve the design and a partner atelier handles production and delivery to your door.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <p className="eyebrow">The Process</p>
        <div className="mx-auto mt-3 h-px w-12 bg-brass/70" />
        <h2 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
          From feed to finished piece
        </h2>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-cozy border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="flex flex-col gap-4 bg-parchment p-7">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-burgundy">
                {s.n}
              </span>
              <span className="h-px flex-1 bg-brass/40" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink">{s.title}</h3>
            <p className="text-sm leading-relaxed text-ink/65">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
