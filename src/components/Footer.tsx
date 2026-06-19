import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cocoa/10 bg-oat/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-cocoa/60">
            One-of-one tops designed from your own style. Read by AI, made by
            people, shipped to your door.
          </p>
        </div>
        <div className="text-sm text-cocoa/60">
          <p className="font-semibold text-cocoa/80">How it works</p>
          <ul className="mt-2 space-y-1">
            <li>1. Share a public Instagram handle</li>
            <li>2. We read your style</li>
            <li>3. We design your piece</li>
            <li>4. A partner studio makes &amp; ships it</li>
          </ul>
        </div>
        <div className="max-w-xs text-xs leading-relaxed text-cocoa/45">
          Cozy Tops analyzes only public content, with the visitor&apos;s
          consent, to design a garment. We don&apos;t store your photos. Demo
          mode uses sample personas.
        </div>
      </div>
      <div className="border-t border-cocoa/10 py-4 text-center text-xs text-cocoa/40">
        © {new Date().getFullYear()} Cozy Tops. Made cozy.
      </div>
    </footer>
  );
}
