import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Cozy Tops home"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-cream shadow-cozy-sm transition group-hover:rotate-6">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path
            d="M6 16c4-6 16-6 20 0M6 16c4 6 16 6 20 0M16 3c-6 4-6 22 0 26M16 3c6 4 6 22 0 26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.8"
          />
        </svg>
      </span>
      <span className="font-display text-2xl font-bold leading-none tracking-tight text-cocoa">
        Cozy<span className="text-terracotta"> Tops</span>
      </span>
    </Link>
  );
}
