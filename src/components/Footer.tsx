import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-oat/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-ink/60">
            One-of-one garments, drawn from your own style. Read by machine,
            made by hand, delivered to your door.
          </p>
        </div>
        <div>
          <p className="eyebrow">The Process</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/60">
            <li>Share a public handle</li>
            <li>We read your style</li>
            <li>We design your piece</li>
            <li>An atelier makes &amp; ships it</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">In Confidence</p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink/45">
            Cozy Tops studies only public content, with the visitor&apos;s
            consent, to design a single garment. We do not store your
            photographs. Demo mode uses sample personas.
          </p>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-[0.62rem] font-medium uppercase tracking-luxe text-ink/40">
        © {new Date().getFullYear()} Cozy Tops Atelier · Made to Order
      </div>
    </footer>
  );
}
