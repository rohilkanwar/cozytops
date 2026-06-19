import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/fulfillment";
import type { DesignBrief } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  handle: z.string().min(1),
  garment: z.enum(["sweater", "tee", "jacket"]),
  size: z.string().min(1),
  // The full design brief travels with the order so fulfillment has everything.
  design: z.object({}).passthrough(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  try {
    const confirmation = await createOrder({
      handle: parsed.handle,
      garment: parsed.garment,
      size: parsed.size,
      design: parsed.design as unknown as DesignBrief,
    });
    return NextResponse.json(confirmation);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
