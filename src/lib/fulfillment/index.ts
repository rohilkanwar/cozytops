import type { GarmentType, OrderConfirmation, OrderRequest, Product } from "../types";
import { config } from "../config";
import { createPrintfulOrder } from "./printful";
import { createShopifyOrder } from "./shopify";

// The customer-facing catalog. A real integration maps each garment to a
// fulfillment SKU / Printful variant / Shopify product.
export const CATALOG: Record<GarmentType, Product> = {
  sweater: {
    garment: "sweater",
    name: "The Custom Crew Knit",
    blurb: "Mid-weight cotton knit, ribbed trims, your signature knit into it.",
    basePriceUsd: 128,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    leadTimeDays: 18,
  },
  tee: {
    garment: "tee",
    name: "The Custom Heavyweight Tee",
    blurb: "Garment-dyed 240gsm cotton, boxy and broken-in from day one.",
    basePriceUsd: 48,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    leadTimeDays: 9,
  },
  jacket: {
    garment: "jacket",
    name: "The Custom Chore Jacket",
    blurb: "Cotton-twill chore coat, corozo buttons, built to outlive trends.",
    basePriceUsd: 164,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    leadTimeDays: 21,
  },
};

export function getProduct(garment: GarmentType): Product {
  return CATALOG[garment];
}

export function listProducts(): Product[] {
  return Object.values(CATALOG);
}

function newOrderId(): string {
  return `CT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

/**
 * Places an order with the configured fulfillment partner. No silent
 * fallbacks: if a real partner is configured and fails, the error propagates
 * to the caller instead of pretending the order went through. Only the
 * explicit demo provider returns a simulated (clearly labeled) confirmation.
 */
export async function createOrder(req: OrderRequest): Promise<OrderConfirmation> {
  const product = getProduct(req.garment);
  const totalUsd = product.basePriceUsd;
  const orderId = newOrderId();

  if (config.fulfillment.provider !== "demo") {
    try {
      if (config.fulfillment.provider === "printful") {
        return await createPrintfulOrder(req, { orderId, totalUsd, product });
      }
      return await createShopifyOrder(req, { orderId, totalUsd, product });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error";
      throw new Error(
        `Fulfillment via ${config.fulfillment.provider} failed: ${reason}. The order was NOT placed.`,
      );
    }
  }

  return {
    orderId,
    status: "simulated",
    provider: "demo",
    etaDays: product.leadTimeDays,
    totalUsd,
    message: `SIMULATED order for the ${product.name} — no real fulfillment is configured, nothing will be manufactured or shipped. Set FULFILLMENT_PROVIDER=printful or shopify to ship for real.`,
  };
}
