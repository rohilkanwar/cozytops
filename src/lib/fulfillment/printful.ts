import type { OrderConfirmation, OrderRequest, Product } from "../types";
import { config } from "../config";

interface Ctx {
  orderId: string;
  totalUsd: number;
  product: Product;
}

// ---------------------------------------------------------------------------
// Printful print-on-demand path. The real flow:
//   1. Upload the generated artwork (rasterized mockup / print file) to Printful.
//   2. Create an order against the matching variant_id for the garment + size.
//   3. Return Printful's order id + estimated fulfillment time.
// This stub validates configuration and shows the request shape; flesh out the
// artwork upload + variant mapping when going live.
// ---------------------------------------------------------------------------
export async function createPrintfulOrder(
  req: OrderRequest,
  ctx: Ctx,
): Promise<OrderConfirmation> {
  if (!config.fulfillment.printfulApiKey) {
    throw new Error("PRINTFUL_API_KEY not set");
  }

  // Example shape (left un-sent until variant mapping + recipient are wired):
  // await fetch("https://api.printful.com/orders", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${config.fulfillment.printfulApiKey}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     recipient: { /* shipping address collected at checkout */ },
  //     items: [{ variant_id: mapVariant(req.garment, req.size), quantity: 1,
  //               files: [{ url: artworkUrl }] }],
  //   }),
  // });

  throw new Error("Printful order creation not yet wired (needs variant map + artwork upload)");
}
