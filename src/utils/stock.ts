import type { ProductType } from "@/interfaces";

type StockSource = Pick<ProductType, "quantity" | "size_stock">;

// How many units of one size a customer can put in the loadout.
// Products with a per-size stock map are capped by that size; the rest fall
// back to the overall quantity. create-order re-checks this server-side.
export function getMaxQuantity(product: StockSource, size: string | number): number {
  const sizeStock = product.size_stock;
  if (sizeStock && Object.keys(sizeStock).length > 0) {
    return Math.max(0, sizeStock[String(size)] ?? 0);
  }
  return Math.max(0, product.quantity ?? 0);
}
