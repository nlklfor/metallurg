import { describe, expect, it } from "vitest";
import type { ProductType } from "@/interfaces";
import { DEFAULT_FILTERS } from "@/lib/constants/filters";
import {
  activeFilterCount,
  availableSizes,
  filterProducts,
  getCatalogFacets,
  totalStock,
} from "@/utils/filterUtils";

const product = (over: Partial<ProductType>): ProductType => ({
  id: over.slug ?? "p",
  name: "Object",
  price: 4000,
  sizes: [],
  stock_status: "in_stock",
  is_new: false,
  slug: "p",
  quantity: 1,
  image_url: [],
  category: "footwear",
  ...over,
});

const jordan = product({
  slug: "jordan-1",
  price: 4299,
  created_at: "2026-09-01T10:00:00Z",
  size_stock: { "44": 1 },
});
const mind = product({
  slug: "mind-001",
  price: 6499,
  stock_status: "pre_order",
  created_at: "2026-09-05T10:00:00Z",
  size_stock: { "44": 2, "45": 0, "46": 2 },
});
const hoodie = product({
  slug: "hoodie",
  price: 4799,
  category: "apparel",
  stock_status: "pre_order",
  created_at: "2026-10-20T10:00:00Z",
  size_stock: { M: 5, L: 5, XL: 5 },
});
const archived = product({
  slug: "aj4-cave",
  price: 8000,
  stock_status: "out_of_stock",
  created_at: "2026-10-25T10:00:00Z",
  size_stock: { "42": 0 },
});
const all = [jordan, mind, hoodie, archived];
const slugs = (list: ProductType[]) => list.map((p) => p.slug);

describe("availableSizes / totalStock", () => {
  it("lists only sizes with units left", () => {
    expect(availableSizes(mind)).toEqual(["44", "46"]);
    expect(totalStock(mind)).toBe(4);
  });

  it("falls back to sizes and quantity without a stock map", () => {
    const p = product({ sizes: [42, 43], quantity: 3, size_stock: {} });
    expect(availableSizes(p)).toEqual(["42", "43"]);
    expect(totalStock(p)).toBe(3);
  });
});

describe("filterProducts", () => {
  it("sorts newest first by created_at and keeps archived objects last", () => {
    expect(slugs(filterProducts(all, DEFAULT_FILTERS))).toEqual([
      "hoodie",
      "mind-001",
      "jordan-1",
      "aj4-cave",
    ]);
  });

  it("sorts by price but still puts archived objects last", () => {
    const res = filterProducts(all, { ...DEFAULT_FILTERS, sortBy: "price-desc" });
    expect(slugs(res)).toEqual(["mind-001", "hoodie", "jordan-1", "aj4-cave"]);
  });

  it("filters by size using real stock", () => {
    const res = filterProducts(all, { ...DEFAULT_FILTERS, sizes: ["45"] });
    expect(res).toEqual([]);
    const res44 = filterProducts(all, { ...DEFAULT_FILTERS, sizes: ["44"] });
    expect(slugs(res44)).toEqual(["mind-001", "jordan-1"]);
  });

  it("hides archived objects when availability is chosen or the toggle is off", () => {
    expect(slugs(filterProducts(all, { ...DEFAULT_FILTERS, stockStatus: ["in_stock"] }))).toEqual([
      "jordan-1",
    ]);
    expect(slugs(filterProducts(all, { ...DEFAULT_FILTERS, showArchived: false }))).not.toContain(
      "aj4-cave"
    );
  });

  it("applies category and price range", () => {
    const res = filterProducts(all, {
      ...DEFAULT_FILTERS,
      category: "footwear",
      priceRange: [4000, 5000],
    });
    expect(slugs(res)).toEqual(["jordan-1"]);
  });
});

describe("getCatalogFacets", () => {
  it("counts live objects per category, collects sizes and rounds price bounds", () => {
    const f = getCatalogFacets(all);
    expect(f.categoryCounts).toEqual({ footwear: 2, apparel: 1, accessories: 0 });
    expect(f.sizes).toEqual(["44", "46", "M", "L", "XL"]);
    expect(f.priceBounds).toEqual([4000, 8000]);
  });
});

describe("activeFilterCount", () => {
  it("is zero for defaults and counts each change", () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(
      activeFilterCount({ ...DEFAULT_FILTERS, sizes: ["44", "45"], category: "apparel" })
    ).toBe(3);
  });
});
