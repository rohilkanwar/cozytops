"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  AnalyzeResponse,
  DesignResponse,
  GarmentType,
  OrderConfirmation,
} from "@/lib/types";
import { AnalyzingView } from "./AnalyzingView";
import { StyleProfileCard } from "./StyleProfileCard";
import { GarmentPicker } from "./GarmentPicker";
import { MockupView } from "./MockupView";
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

  const lastHandle = useRef<string | null>(null);

  async function runDesign(resp: AnalyzeResponse, g: GarmentType, cache: typeof designs) {
    if (cache[g]) {
      setGarment(g);
      return;
    }
    setDesigning(true);
    try {
      const d = await postJson<DesignResponse>("/api/design", {
        style: resp.style,
        garment: g,
        displayName: resp.profile.displayName,
      });
      setDesigns((prev) => ({ ...prev, [g]: d }));
      setGarment(g);
    } catch {
      /* keep current design on failure */
    } finally {
      setDesigning(false);
    }
  }

  async function runAnalyze(handle: string) {
    setPhase("analyzing");
    setAnalyzeError(null);
    setData(null);
    setDesigns({});
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
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Let&apos;s design your top
        </h1>
        <p className="mt-2 text-cocoa/65">
          Enter a public Instagram handle to begin.
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
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-4xl">🧶</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-cocoa">
          We couldn&apos;t read that one
        </h1>
        <p className="mt-2 text-cocoa/65">{analyzeError}</p>
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-cocoa/50">Designed for</p>
          <p className="font-display text-2xl font-bold text-cocoa">
            @{data?.profile.handle}
          </p>
        </div>
        <Link href="/" className="btn-ghost">
          Try another handle
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {data && <StyleProfileCard data={data} />}

        <div className="space-y-5">
          <div className="card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cocoa/45">
              Choose your canvas
            </p>
            <GarmentPicker selected={garment} onSelect={selectGarment} disabled={designing} />
          </div>

          <MockupView svg={current?.mockupSvg ?? null} designing={designing} />

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
