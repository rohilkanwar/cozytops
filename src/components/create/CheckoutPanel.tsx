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
      <div className="rounded-cozy bg-sage/15 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage text-2xl text-cream">
          ✓
        </div>
        <p className="mt-3 font-display text-xl font-bold text-cocoa">
          {order.status === "simulated" ? "Order simulated!" : "Order confirmed!"}
        </p>
        <p className="mt-1 text-sm text-cocoa/65">{order.message}</p>
        <dl className="mx-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-cocoa/50">Order</dt>
            <dd className="font-mono font-semibold text-cocoa/80">{order.orderId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cocoa/50">Total</dt>
            <dd className="font-semibold text-cocoa/80">${order.totalUsd}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cocoa/50">Arrives in</dt>
            <dd className="font-semibold text-cocoa/80">~{order.etaDays} days</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-cozy bg-oat/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-cocoa">{meta.name}</p>
          <p className="text-sm text-cocoa/55">{meta.tagline}</p>
        </div>
        <p className="font-display text-2xl font-bold text-cocoa">${meta.priceUsd}</p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa/45">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {meta.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`h-10 w-12 rounded-xl border-2 text-sm font-semibold transition ${
                s === size
                  ? "border-terracotta bg-terracotta text-cream"
                  : "border-cocoa/15 bg-white/70 text-cocoa/70 hover:border-cocoa/30"
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
        className="btn-primary mt-5 w-full text-lg"
      >
        {ordering ? "Placing your order…" : "Make it real →"}
      </button>
      <p className="mt-2 text-center text-xs text-cocoa/45">
        Ships in ~{meta.leadTimeDays} days · made to order by a partner studio
      </p>
      {orderError && (
        <p className="mt-2 text-center text-sm text-terracotta-deep">{orderError}</p>
      )}
    </div>
  );
}
