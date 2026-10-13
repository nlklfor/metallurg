import { beforeEach, describe, expect, it } from "vitest";
import type { ProductType } from "@/interfaces";
import { computeTotal } from "@/utils/computeTotal";
import { getMaxQuantity } from "@/utils/stock";
import { serializeCartItems } from "@/utils/orderUtils";
import { useCartStore } from "@/stores/useCartStore";

const product = (over: Partial<ProductType> = {}): ProductType => ({
  createdAt: "2026-10-01",
  id: "p1",
  name: "New Balance Joe Freshgoods ABZORB 1890",
  price: 5299,
  sizes: [41, 46],
  stock_status: "pre_order",
  is_new: false,
  slug: "nb-1890",
  quantity: 28,
  size_stock: { "41": 3, "46": 5 },
  image_url: [],
  ...over,
});

describe("getMaxQuantity", () => {
  it("caps by the stock of the chosen size, not the overall quantity", () => {
    expect(getMaxQuantity(product(), 41)).toBe(3);
    expect(getMaxQuantity(product(), "46")).toBe(5);
  });

  it("returns 0 for a size that is not in the stock map", () => {
    expect(getMaxQuantity(product(), 44)).toBe(0);
  });

  it("falls back to overall quantity when there is no size map", () => {
    expect(getMaxQuantity(product({ size_stock: undefined, quantity: 2 }), 44)).toBe(2);
    expect(getMaxQuantity(product({ size_stock: {}, quantity: 1 }), 44)).toBe(1);
  });
});

describe("computeTotal", () => {
  it("multiplies price by cart quantity", () => {
    const items = [
      { ...product(), selectedSize: 41, cart_quantity: 2 },
      { ...product({ id: "p2", price: 4299 }), selectedSize: 44, cart_quantity: 1 },
    ];
    expect(computeTotal(items)).toBe(5299 * 2 + 4299);
  });
});

describe("serializeCartItems", () => {
  it("keeps product_id and cart_quantity for create-order", () => {
    const [line] = serializeCartItems([{ ...product(), selectedSize: 41, cart_quantity: 3 }]);
    expect(line).toEqual({
      product_id: "p1",
      name: "New Balance Joe Freshgoods ABZORB 1890",
      selectedSize: 41,
      price: 5299,
      cart_quantity: 3,
    });
  });
});

describe("useCartStore.increaseQuantity", () => {
  beforeEach(() => useCartStore.getState().clearCart());

  it("stops at the size stock", () => {
    const { addToCart, increaseQuantity } = useCartStore.getState();
    addToCart(product(), 41, 1);
    for (let i = 0; i < 10; i++) increaseQuantity("p1", 41);
    expect(useCartStore.getState().items[0].cart_quantity).toBe(3);
  });
});
