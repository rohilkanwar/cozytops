import type { GarmentType } from "@/lib/types";

// Client-safe presentational catalog (mirrors lib/fulfillment CATALOG values),
// kept separate so the client bundle never pulls in server-only fulfillment code.
export interface GarmentMeta {
  type: GarmentType;
  name: string;
  tagline: string;
  priceUsd: number;
  leadTimeDays: number;
  sizes: string[];
}

export const GARMENTS: GarmentMeta[] = [
  {
    type: "sweater",
    name: "Custom Crew Knit",
    tagline: "Mid-weight cotton knit",
    priceUsd: 128,
    leadTimeDays: 18,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  },
  {
    type: "tee",
    name: "Custom Heavyweight Tee",
    tagline: "Garment-dyed 240gsm cotton",
    priceUsd: 48,
    leadTimeDays: 9,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  },
  {
    type: "jacket",
    name: "Custom Chore Jacket",
    tagline: "Cotton-twill, corozo buttons",
    priceUsd: 164,
    leadTimeDays: 21,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  },
];

export const garmentMeta = (t: GarmentType): GarmentMeta =>
  GARMENTS.find((g) => g.type === t) as GarmentMeta;
