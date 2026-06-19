"use client";

import { useState } from "react";
import type { GarmentType, OrderConfirmation } from "@/lib/types";
import { garmentMeta } from "../garmentMeta";

export function CheckoutPanel({
  garment,
  ordering,
  order,
  orderError,
  onOrder,
}: {
  garment: GarmentType;
  ordering: boolean;
  order: OrderConfirmation | null;
  orderError: string | null;
  onOrder: (size: string) => void;
}) {
  const meta = garmentMeta(garment);
  const [size, setSize] = useState("M");

  if (order) {
    return (
      <div className="rounded-cozy border border-forest/25 bg-forest/[0.07] p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-4 eyebrow text-forest-deep">
          {order.status === "simulated" ? "Order simulated" : "Order confirmed"}
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">
          Your commission is placed
        </p>
        <p className="mt-1 text-sm text-ink/65">{order.message}</p>
        <dl className="mx-auto mt-5 max-w-xs space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">Order</dt>
            <dd className="font-mono text-ink/80">{order.orderId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">Total</dt>
            <dd className="font-medium text-ink/80">${order.totalUsd}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[0.62rem] font-medium uppercase tracking-luxe text-ink/45">Arrives in</dt>
            <dd className="font-medium text-ink/80">~{order.etaDays} days</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-cozy border border-ink/10 bg-cream/50 p-6">
      <div className="flex items-end justify-between border-b border-ink/10 pb-4">
        <div>
          <p className="font-display text-xl font-semibold text-ink">{meta.name}</p>
          <p className="mt-0.5 text-sm italic text-ink/55">{meta.tagline}</p>
        </div>
        <p className="font-display text-3xl font-semibold text-ink">${meta.priceUsd}</p>
      </div>

      <div className="mt-5">
        <p className="eyebrow">Select size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`h-10 w-12 rounded-cozy border text-sm font-medium transition ${
                s === size
                  ? "border-burgundy bg-burgundy text-cream"
                  : "border-ink/15 bg-cream text-ink/70 hover:border-ink/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={ordering}
        onClick={() => onOrder(size)}
        className="btn-primary mt-6 w-full"
      >
        {ordering ? "Placing your order…" : "Make It Yours"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/45">
        Made to order · ships in ~{meta.leadTimeDays} days by a partner atelier
      </p>
      {orderError && (
        <p className="mt-2 text-center text-sm text-burgundy">{orderError}</p>
      )}
    </div>
  );
}
