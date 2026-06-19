import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Cozy Tops home"
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center transition group-hover:scale-[1.03]">
        <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
          <circle cx="20" cy="20" r="18.5" fill="none" stroke="#16293F" strokeWidth="1" />
          <circle cx="20" cy="20" r="14.5" fill="none" stroke="#A98B4E" strokeWidth="0.8" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-[1.05rem] font-semibold tracking-tight text-navy">
          CT
        </span>
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.4rem] font-semibold uppercase tracking-[0.2em] text-ink">
          Cozy Tops
        </span>
        <span className="mt-1 block text-[0.55rem] font-medium uppercase tracking-crest text-ink/40">
          Atelier · Est. 2026
        </span>
      </span>
    </Link>
  );
}
