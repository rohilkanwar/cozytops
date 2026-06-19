import type { OrderConfirmation, OrderRequest, Product } from "../types";
import { config } from "../config";

interface Ctx {
  orderId: string;
  totalUsd: number;
  product: Product;
}

// ---------------------------------------------------------------------------
// Shopify path. Two common patterns:
//   A) Storefront API: create a cart/checkout for a (custom) product + line-item
//      properties carrying the design, then redirect the customer to Shopify's
//      hosted checkout for payment + shipping.
//   B) Admin API: create a draft order programmatically once the design is set.
// For a one-of-one design, attach the design brief + artwork URL as line item
// properties so it flows through to your fulfillment app.
// ---------------------------------------------------------------------------
export async function createShopifyOrder(
  req: OrderRequest,
  ctx: Ctx,
): Promise<OrderConfirmation> {
  if (!config.fulfillment.shopifyDomain || !config.fulfillment.shopifyToken) {
    throw new Error("SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN not set");
  }

  // Example: create a draft order via the Admin API.
  // await fetch(`https://${config.fulfillment.shopifyDomain}/admin/api/2024-10/draft_orders.json`, {
  //   method: "POST",
  //   headers: {
  //     "X-Shopify-Access-Token": config.fulfillment.shopifyToken,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     draft_order: {
  //       line_items: [{
  //         title: req.design.title,
  //         price: ctx.totalUsd,
  //         quantity: 1,
  //         properties: [
  //           { name: "Garment", value: req.garment },
  //           { name: "Size", value: req.size },
  //           { name: "Design", value: req.design.title },
  //         ],
  //       }],
  //     },
  //   }),
  // });

  throw new Error("Shopify order creation not yet wired (needs product + checkout setup)");
}
