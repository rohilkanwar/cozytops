import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { CreateExperience } from "@/components/create/CreateExperience";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function CreatePage({
  searchParams,
}: {
  searchParams: {
    handle?: string | string[];
    connected?: string | string[];
    connect_error?: string | string[];
  };
}) {
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";
  const handle = first(searchParams.handle);
  const connected = first(searchParams.connected) === "1";
  const connectError = first(searchParams.connect_error) || undefined;

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo />
        </div>
      </header>

      <CreateExperience
        initialHandle={handle}
        initialConnected={connected}
        connectEnabled={config.instagram.oauth.enabled}
        connectError={connectError}
      />

      <Footer />
    </main>
  );
}
