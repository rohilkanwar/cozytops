"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  AnalyzeResponse,
  DesignResponse,
  GarmentImage,
  GarmentType,
  OrderConfirmation,
  ShotKind,
} from "@/lib/types";
import { AnalyzingView } from "./AnalyzingView";
import { StyleProfileCard } from "./StyleProfileCard";
import { GarmentPicker } from "./GarmentPicker";
import { DesignGallery } from "./DesignGallery";
import { DesignDetails } from "./DesignDetails";
import { CheckoutPanel } from "./CheckoutPanel";
import { HandleInput } from "../HandleInput";

type Phase = "idle" | "analyzing" | "ready" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Something went wrong.");
  return json as T;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type StartResponse = {
  jobId?: string;
  kind?: ShotKind;
  alt?: string;
  unavailable?: boolean;
};
type PollResponse = {
  status: "pending" | "completed" | "failed";
  src?: string;
  error?: string;
};

export function CreateExperience({ initialHandle }: { initialHandle: string }) {
  const [phase, setPhase] = useState<Phase>(initialHandle ? "analyzing" : "idle");
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const [garment, setGarment] = useState<GarmentType>("sweater");
  const [designs, setDesigns] = useState<Partial<Record<GarmentType, DesignResponse>>>({});
  const [designing, setDesigning] = useState(false);

  const [ordering, setOrdering] = useState(false);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Photorealistic images, generated + cached per garment.
  const [images, setImages] = useState<Partial<Record<GarmentType, GarmentImage[]>>>({});
  const [pending, setPending] = useState<Partial<Record<GarmentType, number>>>({});
  const [imgErrors, setImgErrors] = useState<Partial<Record<GarmentType, string>>>({});
  const [imgUnavailable, setImgUnavailable] = useState(false);

  const lastHandle = useRef<string | null>(null);
  const startedImages = useRef<Set<GarmentType>>(new Set());
  const imgUnavailableRef = useRef(false);
  const runId = useRef(0);

  // Generates the photoreal shots for a garment, one request at a time so each
  // stays under the serverless timeout; images stream in + are cached per garment.
  async function ensureImages(
    g: GarmentType,
    design: DesignResponse["design"],
    vibe: string,
  ) {
    if (imgUnavailableRef.current || startedImages.current.has(g)) return;
    startedImages.current.add(g);
    const myRun = runId.current;
    setImgErrors((prev) => ({ ...prev, [g]: undefined }));

    const shots: { shot: ShotKind; variant: number }[] = [
      { shot: "product", variant: 0 },
      { shot: "model", variant: 0 },
      { shot: "model", variant: 1 },
    ];
    setImages((prev) => ({ ...prev, [g]: [] }));
    setPending((prev) => ({ ...prev, [g]: shots.length }));

    let firstError: string | undefined;

    // 1) Kick off every shot as a background job (each returns an id in ~1s).
    const jobs: { id: string; kind: ShotKind; alt: string }[] = [];
    for (const { shot, variant } of shots) {
      try {
        const r = await postJson<StartResponse>("/api/render/start", {
          design,
          shot,
          variant,
          vibe,
        });
        if (r.unavailable) {
          imgUnavailableRef.current = true;
          setImgUnavailable(true);
          setPending((prev) => ({ ...prev, [g]: 0 }));
          return;
        }
        if (r.jobId && r.kind && r.alt) {
          jobs.push({ id: r.jobId, kind: r.kind, alt: r.alt });
        }
      } catch (e) {
        if (!firstError) {
          firstError = e instanceof Error ? e.message : "Failed to start image job.";
        }
      }
    }
    if (runId.current !== myRun) return;
    setPending((prev) => ({ ...prev, [g]: jobs.length }));
    if (jobs.length === 0) {
      if (firstError) setImgErrors((prev) => ({ ...prev, [g]: firstError }));
      return;
    }

    // 2) Poll each job until it resolves; images stream in as they finish.
    const pendingIds = new Set(jobs.map((j) => j.id));
    let got = 0;
    for (let attempt = 0; attempt < 75 && pendingIds.size > 0; attempt++) {
      await delay(4000);
      if (runId.current !== myRun) return;
      for (const job of jobs) {
        if (!pendingIds.has(job.id)) continue;
        try {
          const p = await postJson<PollResponse>("/api/render/poll", { id: job.id });
          if (p.status === "completed" && p.src) {
            pendingIds.delete(job.id);
            got += 1;
            const src = p.src;
            setImages((prev) => ({
              ...prev,
              [g]: [...(prev[g] ?? []), { kind: job.kind, src, alt: job.alt }],
            }));
            setPending((prev) => ({ ...prev, [g]: Math.max(0, (prev[g] ?? 1) - 1) }));
          } else if (p.status === "failed") {
            pendingIds.delete(job.id);
            if (!firstError) firstError = p.error || "Image generation failed.";
            setPending((prev) => ({ ...prev, [g]: Math.max(0, (prev[g] ?? 1) - 1) }));
          }
        } catch {
          /* transient poll error — retry on the next attempt */
        }
      }
    }
    if (runId.current !== myRun) return;
    setPending((prev) => ({ ...prev, [g]: 0 }));
    if (got === 0 && firstError) {
      setImgErrors((prev) => ({ ...prev, [g]: firstError }));
    }
  }

  // Re-attempt image generation for the current garment after a failure.
  function retryImages() {
    if (!data) return;
    const g = garment;
    const design = designs[g]?.design;
    if (!design) return;
    startedImages.current.delete(g);
    setImgErrors((prev) => ({ ...prev, [g]: undefined }));
    setImages((prev) => {
      const next = { ...prev };
      delete next[g];
      return next;
    });
    void ensureImages(g, design, data.style.vibeName);
  }

  async function runDesign(resp: AnalyzeResponse, g: GarmentType, cache: typeof designs) {
    let design = cache[g]?.design;
    if (!cache[g]) {
      setDesigning(true);
      try {
        const d = await postJson<DesignResponse>("/api/design", {
          style: resp.style,
          garment: g,
          displayName: resp.profile.displayName,
        });
        setDesigns((prev) => ({ ...prev, [g]: d }));
        design = d.design;
      } catch {
        setDesigning(false);
        return;
      }
      setDesigning(false);
    }
    setGarment(g);
    if (design) void ensureImages(g, design, resp.style.vibeName);
  }

  async function runAnalyze(handle: string) {
    setPhase("analyzing");
    setAnalyzeError(null);
    setData(null);
    setDesigns({});
    setImages({});
    setPending({});
    setImgErrors({});
    startedImages.current.clear();
    runId.current += 1;
    setOrder(null);
    setOrderError(null);
    try {
      const resp = await postJson<AnalyzeResponse>("/api/analyze", { handle });
      setData(resp);
      setGarment("sweater");
      setPhase("ready");
      void runDesign(resp, "sweater", {});
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed.");
      setPhase("error");
    }
  }

  // Kick off (or re-run) analysis whenever the handle in the URL changes.
  useEffect(() => {
    if (initialHandle && initialHandle !== lastHandle.current) {
      lastHandle.current = initialHandle;
      void runAnalyze(initialHandle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHandle]);

  function selectGarment(g: GarmentType) {
    if (!data || g === garment) return;
    setOrder(null);
    setOrderError(null);
    void runDesign(data, g, designs);
  }

  async function placeOrder(size: string) {
    const current = designs[garment];
    if (!current || !data) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const conf = await postJson<OrderConfirmation>("/api/checkout", {
        handle: data.profile.handle,
        garment,
        size,
        design: current.design,
      });
      setOrder(conf);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setOrdering(false);
    }
  }

  // ----- render states -----

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="eyebrow">The Atelier</p>
        <div className="mx-auto mt-3 h-px w-12 bg-brass/70" />
        <h1 className="mt-5 font-display text-4xl font-semibold text-ink">
          Let us design your piece
        </h1>
        <p className="mt-3 text-ink/65">
          Offer a public Instagram handle to begin.
        </p>
        <div className="mt-8 text-left">
          <HandleInput autoFocus />
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingView handle={initialHandle} />;
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="eyebrow text-burgundy/70">Not Found</p>
        <div className="mx-auto mt-3 h-px w-12 bg-brass/70" />
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          We couldn&apos;t read that one
        </h1>
        <p className="mt-3 text-ink/65">{analyzeError}</p>
        <div className="mt-8 text-left">
          <HandleInput autoFocus />
        </div>
      </div>
    );
  }

  // ready
  const current = data ? designs[garment] : undefined;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="eyebrow">Designed for</p>
          <p className="mt-1.5 font-display text-3xl font-semibold text-ink">
            @{data?.profile.handle}
          </p>
        </div>
        <Link href="/" className="btn-ghost">
          New Handle
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {data && <StyleProfileCard data={data} />}

        <div className="space-y-5">
          <div className="card p-6">
            <p className="eyebrow mb-4">Choose your canvas</p>
            <GarmentPicker selected={garment} onSelect={selectGarment} disabled={designing} />
          </div>

          <DesignGallery
            key={garment}
            svg={current?.mockupSvg ?? ""}
            images={images[garment] ?? []}
            pending={pending[garment] ?? 0}
            unavailable={imgUnavailable}
            designing={designing}
            error={imgErrors[garment] ?? null}
            onRetry={retryImages}
          />

          {current && (
            <div className="card p-6">
              <DesignDetails design={current.design} engine={current.engine} />
            </div>
          )}

          <CheckoutPanel
            garment={garment}
            ordering={ordering}
            order={order}
            orderError={orderError}
            onOrder={placeOrder}
          />
        </div>
      </div>
    </div>
  );
}
