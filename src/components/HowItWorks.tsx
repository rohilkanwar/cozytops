const STEPS = [
  {
    n: "01",
    title: "Share your handle",
    body: "Paste a public Instagram handle. That's the only input we need.",
    icon: "𓎩",
  },
  {
    n: "02",
    title: "We read your style",
    body: "Vision models study your photos and captions — palette, textures, the garments you gravitate to.",
    icon: "✦",
  },
  {
    n: "03",
    title: "We design your piece",
    body: "A custom sweater, tee, or jacket, with a signature detail pulled straight from who you are.",
    icon: "✎",
  },
  {
    n: "04",
    title: "It gets made & shipped",
    body: "Approve it and a partner studio handles production and delivery to your door.",
    icon: "✉",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <span className="chip bg-sage/20 text-sage-deep">How it works</span>
        <h2 className="mt-4 text-3xl font-bold text-cocoa sm:text-4xl">
          From feed to fit in four steps
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="card flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-3xl font-semibold text-terracotta/30">
                {s.n}
              </span>
              <span className="text-2xl" aria-hidden="true">
                {s.icon}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-cocoa">{s.title}</h3>
            <p className="text-sm leading-relaxed text-cocoa/65">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
