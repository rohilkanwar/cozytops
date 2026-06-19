import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { CreateExperience } from "@/components/create/CreateExperience";

export const dynamic = "force-dynamic";

export default function CreatePage({
  searchParams,
}: {
  searchParams: { handle?: string | string[] };
}) {
  const raw = searchParams.handle;
  const handle = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo />
        </div>
      </header>

      <CreateExperience initialHandle={handle} />

      <Footer />
    </main>
  );
}
