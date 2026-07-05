"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  AnalyzeResponse,
  DesignBrief,
  DesignResponse,
  GarmentImage,
  GarmentType,
  OrderConfirmation,
  ShopResponse,
  ShotKind,
} from "@/lib/types";
import { AnalyzingView } from "./AnalyzingView";
import { StyleProfileCard } from "./StyleProfileCard";
import { GarmentPicker } from "./GarmentPicker";
import { OptionPicker } from "./OptionPicker";
import { DesignGallery } from "./DesignGallery";
import { DesignDetails } from "./DesignDetails";
import { CheckoutPanel } from "./CheckoutPanel";
import { ShopTheVibe } from "./ShopTheVibe";
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
};
type PollStatus = {
  status: "pending" | "completed" | "failed";
  src?: string;
  error?: string;
};
type PollResponse = { results: Record<string, PollStatus> };

type PersistedJob = { id: string; kind: ShotKind; alt: string };
type PersistedRun = {
  v: 3;
  handle: string;
  savedAt: number;
  data: AnalyzeResponse;
  designs: Partial<Record<GarmentType, DesignResponse>>;
  /** Image jobs keyed by "<garment>:<optionIndex>" (+ ":t" for preview thumbs). */
  jobs: Record<string, PersistedJob[]>;
  /** Selected option per garment, so a refresh resumes the same design. */
  selOpt: Partial<Record<GarmentType, number>>;
  /** Cached shop-the-vibe recommendations per garment. */
  shop?: Partial<Record<GarmentType, ShopResponse>>;
  vibe: string;
};

// A run is kept for 24h — comfortably inside OpenAI's stored-response retention,
// so persisted job ids still resolve to their finished images after a refresh.
const RUN_TTL_MS = 1000 * 60 * 60 * 24;
const runKey = (handle: string) => `cozytops:run:${handle.toLowerCase()}`;
const imgKey = (g: GarmentType, opt: number) => `${g}:${opt}`;
const thumbKey = (g: GarmentType, opt: number) => `${g}:${opt}:t`;

function loadRun(handle: string): PersistedRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(runKey(handle));
    if (!raw) return null;
    const run = JSON.parse(raw) as PersistedRun;
    if (run.v !== 3 || !run.data) return null;
    if (Date.now() - run.savedAt > RUN_TTL_MS) return null;
    return run;
  } catch {
    return null;
  }
}

function saveRun(run: PersistedRun) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(runKey(run.handle), JSON.stringify(run));
  } catch {
    /* private mode / quota — persistence is best-effort, never fatal */
  }
}

export function CreateExperience({
  initialHandle,
  initialConnected = false,
  connectEnabled = false,
  connectError,
}: {
  initialHandle: string;
  initialConnected?: boolean;
  connectEnabled?: boolean;
  connectError?: string;
}) {
  const [phase, setPhase] = useState<Phase>(
    initialHandle || initialConnected ? "analyzing" : "idle",
  );
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const [garment, setGarment] = useState<GarmentType>("sweater");
  const [designs, setDesigns] = useState<Partial<Record<GarmentType, DesignResponse>>>({});
  const [selOpt, setSelOpt] = useState<Partial<Record<GarmentType, number>>>({});
  const [designing, setDesigning] = useState(false);
  const [designErrors, setDesignErrors] = useState<Partial<Record<GarmentType, string>>>({});

  const [ordering, setOrdering] = useState(false);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Affiliate "shop the vibe" picks, fetched + cached per garment.
  const [shop, setShop] = useState<Partial<Record<GarmentType, ShopResponse>>>({});
  const [shopErrors, setShopErrors] = useState<Partial<Record<GarmentType, string>>>({});

  // Photorealistic images, generated + cached per garment option ("g:opt").
  const [images, setImages] = useState<Record<string, GarmentImage[]>>({});
  const [pending, setPending] = useState<Record<string, number>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, string | undefined>>({});

  const lastHandle = useRef<string | null>(null);
  const connectedStarted = useRef(false);
  const startedImages = useRef<Set<string>>(new Set());
  const startedShop = useRef<Set<GarmentType>>(new Set());
  const runId = useRef(0);
  const runRef = useRef<PersistedRun | null>(null);

  // Best-effort durable snapshot of the current run so a refresh re-hydrates
  // without regenerating designs or losing already-finished images.
  function persistPatch(patch: Partial<PersistedRun>) {
    const base = runRef.current;
    if (!base) return;
    runRef.current = { ...base, ...patch, savedAt: Date.now() };
    saveRun(runRef.current);
  }

  // Generates photography for ONE design option. Spend follows attention:
  // tier "preview" renders a single cheap product thumbnail for the option
  // card; tier "full" renders the catalogue-quality 3-shot set, and only runs
  // for the design the visitor actually selects. Each shot is an OpenAI
  // background job (started once, then batch-polled) so no request nears the
  // serverless limit. Job ids are persisted: a refresh re-polls and finished
  // images come straight back — never regenerated.
  async function ensureImages(
    g: GarmentType,
    opt: number,
    design: DesignBrief,
    vibe: string,
    tier: "preview" | "full",
  ) {
    const key = tier === "preview" ? thumbKey(g, opt) : imgKey(g, opt);
    if (startedImages.current.has(key)) return;
    startedImages.current.add(key);
    const myRun = runId.current;
    setImgErrors((prev) => ({ ...prev, [key]: undefined }));
    setImages((prev) => ({ ...prev, [key]: prev[key] ?? [] }));

    let firstError: string | undefined;

    // Reuse persisted job ids when we have them (e.g. after a page refresh);
    // otherwise start a fresh background job per shot.
    let jobs = runRef.current?.jobs?.[key] ?? null;
    if (!jobs || jobs.length === 0) {
      const shots: { shot: ShotKind; variant: number }[] =
        tier === "preview"
          ? [{ shot: "product", variant: 0 }]
          : [
              { shot: "product", variant: 0 },
              { shot: "model", variant: opt % 3 },
              { shot: "model", variant: (opt + 1) % 3 },
            ];
      setPending((prev) => ({ ...prev, [key]: shots.length }));
      const fresh: PersistedJob[] = [];
      for (const { shot, variant } of shots) {
        try {
          const r = await postJson<StartResponse>("/api/render/start", {
            design,
            shot,
            variant,
            vibe,
            tier,
          });
          if (r.jobId && r.kind && r.alt) {
            fresh.push({ id: r.jobId, kind: r.kind, alt: r.alt });
          }
        } catch (e) {
          if (!firstError) {
            firstError = e instanceof Error ? e.message : "Failed to start image job.";
          }
        }
      }
      if (runId.current !== myRun) return;
      jobs = fresh;
      if (jobs.length > 0) {
        persistPatch({ jobs: { ...(runRef.current?.jobs ?? {}), [key]: jobs } });
      }
    }

    setPending((prev) => ({ ...prev, [key]: jobs!.length }));
    if (jobs!.length === 0) {
      if (firstError) setImgErrors((prev) => ({ ...prev, [key]: firstError }));
      return;
    }

    // Batch-poll this option's jobs until all resolve; photos stream in as they
    // finish. First tick is short so refresh-restored jobs pop back in fast.
    const byId = new Map(jobs!.map((j) => [j.id, j]));
    const pendingIds = new Set(byId.keys());
    let got = 0;
    for (let attempt = 0; attempt < 75 && pendingIds.size > 0; attempt++) {
      await delay(attempt === 0 ? 1200 : 4000);
      if (runId.current !== myRun) return;
      let results: Record<string, PollStatus>;
      try {
        const resp = await postJson<PollResponse>("/api/render/poll", {
          ids: [...pendingIds],
        });
        results = resp.results;
      } catch {
        continue; // transient poll error — retry on the next tick
      }
      if (runId.current !== myRun) return;
      for (const [id, p] of Object.entries(results)) {
        const job = byId.get(id);
        if (!job || !pendingIds.has(id)) continue;
        if (p.status === "completed" && p.src) {
          pendingIds.delete(id);
          got += 1;
          const src = p.src;
          setImages((prev) => ({
            ...prev,
            [key]: [...(prev[key] ?? []), { kind: job.kind, src, alt: job.alt }],
          }));
          setPending((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 1) - 1) }));
        } else if (p.status === "failed") {
          pendingIds.delete(id);
          if (!firstError) firstError = p.error || "Image generation failed.";
          setPending((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 1) - 1) }));
        }
      }
    }
    if (runId.current !== myRun) return;
    setPending((prev) => ({ ...prev, [key]: 0 }));
    if (got === 0 && firstError) {
      setImgErrors((prev) => ({ ...prev, [key]: firstError }));
    }
  }

  // Re-attempt image generation for the currently selected option. Drops its
  // persisted jobs so we truly regenerate rather than re-poll dead ids.
  function retryImages() {
    if (!data) return;
    const g = garment;
    const opt = selOpt[g] ?? 0;
    const design = designs[g]?.options[opt];
    if (!design) return;
    const key = imgKey(g, opt);
    startedImages.current.delete(key);
    if (runRef.current?.jobs?.[key]) {
      const nextJobs = { ...runRef.current.jobs };
      delete nextJobs[key];
      persistPatch({ jobs: nextJobs });
    }
    setImgErrors((prev) => ({ ...prev, [key]: undefined }));
    setImages((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    void ensureImages(g, opt, design, data.style.vibeName, "full");
  }

  // Fetches style-matched affiliate picks for a garment (cached in memory and
  // in the persisted run, so tab switches and refreshes never refetch).
  async function ensureShop(g: GarmentType, resp: AnalyzeResponse) {
    if (startedShop.current.has(g)) return;
    startedShop.current.add(g);
    const cached = runRef.current?.shop?.[g];
    if (cached) {
      setShop((prev) => ({ ...prev, [g]: cached }));
      return;
    }
    setShopErrors((prev) => ({ ...prev, [g]: undefined }));
    try {
      const s = await postJson<ShopResponse>("/api/shop", {
        style: resp.style,
        garment: g,
      });
      setShop((prev) => ({ ...prev, [g]: s }));
      persistPatch({ shop: { ...(runRef.current?.shop ?? {}), [g]: s } });
    } catch (e) {
      startedShop.current.delete(g);
      setShopErrors((prev) => ({
        ...prev,
        [g]: e instanceof Error ? e.message : "Shop recommendations failed.",
      }));
    }
  }

  async function runDesign(
    resp: AnalyzeResponse,
    g: GarmentType,
    cache: typeof designs,
    selectedIdx: number,
  ) {
    void ensureShop(g, resp);
    let set = cache[g];
    setDesignErrors((prev) => ({ ...prev, [g]: undefined }));
    if (!set) {
      setDesigning(true);
      try {
        const d = await postJson<DesignResponse>("/api/design", {
          style: resp.style,
          garment: g,
          displayName: resp.profile.displayName,
        });
        setDesigns((prev) => ({ ...prev, [g]: d }));
        persistPatch({ designs: { ...(runRef.current?.designs ?? {}), [g]: d } });
        set = d;
      } catch (e) {
        // No silent failure: surface the design error with a retry.
        setDesignErrors((prev) => ({
          ...prev,
          [g]: e instanceof Error ? e.message : "Design generation failed.",
        }));
        setDesigning(false);
        setGarment(g);
        return;
      }
      setDesigning(false);
    }
    setGarment(g);
    // Spend follows attention: a cheap preview thumb for every option card,
    // and the full catalogue set only for the selected design.
    const vibe = resp.style.vibeName;
    set.options.forEach((design, idx) => {
      void ensureImages(g, idx, design, vibe, "preview");
    });
    const chosen = set.options[selectedIdx] ?? set.options[0];
    if (chosen) void ensureImages(g, selectedIdx, chosen, vibe, "full");
  }

  // Re-hydrate a saved run after a refresh: restore persona + designs instantly,
  // then re-poll the image jobs (OpenAI still has the finished images by id).
  function restoreRun(cached: PersistedRun) {
    runRef.current = cached;
    setData(cached.data);
    setDesigns(cached.designs);
    setSelOpt(cached.selOpt ?? {});
    setShop(cached.shop ?? {});
    setGarment("sweater");
    setPhase("ready");
    runId.current += 1;
    void runDesign(cached.data, "sweater", cached.designs, cached.selOpt?.sweater ?? 0);
  }

  // Analyze either a typed public handle or the OAuth-connected own account.
  async function runAnalyze(source: { handle: string } | { connected: true }) {
    setPhase("analyzing");
    setAnalyzeError(null);
    setData(null);
    setDesigns({});
    setSelOpt({});
    setImages({});
    setPending({});
    setImgErrors({});
    setDesignErrors({});
    setShop({});
    setShopErrors({});
    startedImages.current.clear();
    startedShop.current.clear();
    runId.current += 1;
    setOrder(null);
    setOrderError(null);
    try {
      const resp = await postJson<AnalyzeResponse>(
        "/api/analyze",
        "connected" in source ? { connected: true } : { handle: source.handle },
      );
      setData(resp);
      const handle = resp.profile.handle;
      lastHandle.current = handle;
      runRef.current = {
        v: 3,
        handle,
        savedAt: Date.now(),
        data: resp,
        designs: {},
        jobs: {},
        selOpt: {},
        vibe: resp.style.vibeName,
      };
      saveRun(runRef.current);
      // After a connect, rewrite the URL to the resolved handle so a refresh
      // re-hydrates from the cached run (no re-analysis, no token needed).
      if ("connected" in source && typeof window !== "undefined") {
        window.history.replaceState(null, "", `/create?handle=${encodeURIComponent(handle)}`);
      }
      setGarment("sweater");
      setPhase("ready");
      void runDesign(resp, "sweater", {}, 0);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed.");
      setPhase("error");
    }
  }

  // Kick off analysis: the connected own-account flow, or a handle from the URL.
  useEffect(() => {
    if (initialConnected && !connectedStarted.current) {
      connectedStarted.current = true;
      void runAnalyze({ connected: true });
      return;
    }
    if (initialHandle && initialHandle !== lastHandle.current) {
      lastHandle.current = initialHandle;
      const cached = loadRun(initialHandle);
      if (cached) restoreRun(cached);
      else void runAnalyze({ handle: initialHandle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHandle, initialConnected]);

  function selectGarment(g: GarmentType) {
    if (!data || g === garment) return;
    setOrder(null);
    setOrderError(null);
    void runDesign(data, g, designs, selOpt[g] ?? 0);
  }

  function selectOption(idx: number) {
    if (idx === (selOpt[garment] ?? 0)) return;
    setOrder(null);
    setOrderError(null);
    setSelOpt((prev) => ({ ...prev, [garment]: idx }));
    persistPatch({ selOpt: { ...(runRef.current?.selOpt ?? {}), [garment]: idx } });
    // Selecting an option is what triggers its full catalogue set (cached, so
    // re-selecting a previously rendered option costs nothing).
    const design = designs[garment]?.options[idx];
    if (data && design) {
      void ensureImages(garment, idx, design, data.style.vibeName, "full");
    }
  }

  async function placeOrder(size: string) {
    const opt = selOpt[garment] ?? 0;
    const design = designs[garment]?.options[opt];
    if (!design || !data) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const conf = await postJson<OrderConfirmation>("/api/checkout", {
        handle: data.profile.handle,
        garment,
        size,
        design,
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
          Offer a public Instagram handle{connectEnabled ? ", or connect your own account," : ""} to begin.
        </p>
        {connectError && (
          <p className="mx-auto mt-6 max-w-md rounded-cozy border-l-2 border-burgundy/40 bg-burgundy/[0.04] px-4 py-2.5 text-sm text-burgundy">
            {connectError}
          </p>
        )}
        <div className="mt-8 text-left">
          <HandleInput autoFocus connectEnabled={connectEnabled} />
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingView handle={initialConnected && !initialHandle ? "your Instagram" : initialHandle} />;
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
          <HandleInput autoFocus connectEnabled={connectEnabled} />
        </div>
      </div>
    );
  }

  // ready
  const current = data ? designs[garment] : undefined;
  const optIdx = selOpt[garment] ?? 0;
  const currentDesign = current?.options[optIdx];
  const currentKey = imgKey(garment, optIdx);

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

          {designErrors[garment] && !current && (
            <div className="card border-burgundy/25 bg-burgundy/[0.04] p-6">
              <p className="text-sm leading-relaxed text-burgundy">
                <span className="font-medium">Design generation failed.</span>{" "}
                {designErrors[garment]}
              </p>
              <button
                type="button"
                onClick={() =>
                  data && void runDesign(data, garment, designs, selOpt[garment] ?? 0)
                }
                className="mt-3 text-[0.62rem] font-medium uppercase tracking-luxe text-burgundy underline underline-offset-2 hover:text-burgundy-deep"
              >
                Try again
              </button>
            </div>
          )}

          {current && current.options.length > 0 && (
            <div className="card p-6">
              <p className="eyebrow mb-4">Choose your design</p>
              <OptionPicker
                options={current.options}
                selected={optIdx}
                thumbs={current.options.map(
                  (_, i) =>
                    images[thumbKey(garment, i)]?.[0] ?? images[imgKey(garment, i)]?.[0],
                )}
                rendering={current.options.map(
                  (_, i) =>
                    ((pending[thumbKey(garment, i)] ?? 0) > 0 ||
                      (pending[imgKey(garment, i)] ?? 0) > 0) &&
                    !images[thumbKey(garment, i)]?.[0] &&
                    !images[imgKey(garment, i)]?.[0],
                )}
                onSelect={selectOption}
              />
            </div>
          )}

          <DesignGallery
            key={currentKey}
            images={images[currentKey] ?? []}
            preview={images[thumbKey(garment, optIdx)]?.[0]}
            pending={pending[currentKey] ?? 0}
            designing={designing}
            error={imgErrors[currentKey] ?? null}
            onRetry={retryImages}
          />

          {currentDesign && current && (
            <div className="card p-6">
              <DesignDetails design={currentDesign} engine={current.engine} />
            </div>
          )}

          <CheckoutPanel
            garment={garment}
            ordering={ordering}
            order={order}
            orderError={orderError}
            onOrder={placeOrder}
          />

          <ShopTheVibe
            shop={shop[garment]}
            loading={!shop[garment] && !shopErrors[garment]}
            error={shopErrors[garment] ?? null}
            onRetry={() => data && void ensureShop(garment, data)}
          />
        </div>
      </div>
    </div>
  );
}
