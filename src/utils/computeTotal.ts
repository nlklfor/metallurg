import type { CartItem } from "@/interfaces";

export function computeTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}
