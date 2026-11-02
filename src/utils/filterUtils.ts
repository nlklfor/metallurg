import type { FilterOptions, ProductType } from "@/interfaces";

type Category = NonNullable<ProductType["category"]>;

const isArchived = (p: ProductType) => p.stock_status === "out_of_stock";

const createdTime = (p: ProductType) => new Date(p.created_at ?? p.createdAt ?? 0).getTime() || 0;

/**
 * Sizes a visitor can still buy, in the order they are stored. Products with a
 * per-size stock map only list sizes with units left; the rest fall back to the
 * plain `sizes` array.
 */
export function availableSizes(product: Pick<ProductType, "sizes" | "size_stock">): string[] {
  const stock = product.size_stock;
  if (stock && Object.keys(stock).length > 0) {
    return Object.keys(stock).filter((s) => (stock[s] ?? 0) > 0);
  }
  return (product.sizes ?? []).map(String);
}

/** Units left across all sizes (falls back to `quantity`). */
export function totalStock(product: Pick<ProductType, "quantity" | "size_stock">): number {
  const stock = product.size_stock;
  if (stock && Object.keys(stock).length > 0) {
    return Object.values(stock).reduce((sum, n) => sum + Math.max(0, n ?? 0), 0);
  }
  return Math.max(0, product.quantity ?? 0);
}

/** Numeric sizes ascending first (41, 42 …), then letter sizes in wearing order. */
const LETTER_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export function compareSizes(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  const aNum = Number.isFinite(na);
  const bNum = Number.isFinite(nb);
  if (aNum && bNum) return na - nb;
  if (aNum) return -1;
  if (bNum) return 1;
  const ia = LETTER_ORDER.indexOf(a.toUpperCase());
  const ib = LETTER_ORDER.indexOf(b.toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b);
}

export interface CatalogFacets {
  /** Live (non-archived) objects per category. */
  categoryCounts: Record<Category, number>;
  /** Every size that still has stock somewhere, sorted. */
  sizes: string[];
  /** Price bounds of the whole catalog, rounded out to whole thousands. */
  priceBounds: [number, number];
}

export function getCatalogFacets(products: ProductType[]): CatalogFacets {
  const categoryCounts: Record<Category, number> = { footwear: 0, apparel: 0, accessories: 0 };
  const sizes = new Set<string>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
    if (isArchived(p)) continue;
    if (p.category) categoryCounts[p.category] += 1;
    for (const s of availableSizes(p)) sizes.add(s);
  }

  const lo = Number.isFinite(min) ? Math.floor(min / 1000) * 1000 : 0;
  const hi = max > 0 ? Math.ceil(max / 1000) * 1000 : 1000;

  return {
    categoryCounts,
    sizes: [...sizes].sort(compareSizes),
    priceBounds: [lo, Math.max(hi, lo + 1000)],
  };
}

export function filterProducts(
  products: ProductType[],
  filters: FilterOptions | null
): ProductType[] {
  if (!filters) return products;

  const filtered = products.filter((product) => {
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])
      return false;
    if (filters.category && product.category !== filters.category) return false;

    if (isArchived(product)) {
      // Archived objects ignore availability/size filters: they are shown for
      // reference only, and only when the visitor wants them.
      return filters.showArchived && filters.stockStatus.length === 0 && filters.sizes.length === 0;
    }

    if (
      filters.stockStatus.length > 0 &&
      !filters.stockStatus.includes(product.stock_status as "in_stock" | "pre_order")
    )
      return false;

    if (filters.sizes.length > 0) {
      const sizes = availableSizes(product);
      if (!filters.sizes.some((s) => sizes.includes(s))) return false;
    }
    return true;
  });

  return sortProducts(filtered, filters.sortBy);
}

/** Sorts by the chosen order; archived objects always go last. */
export function sortProducts(
  products: ProductType[],
  sortBy: FilterOptions["sortBy"]
): ProductType[] {
  const byOrder = (a: ProductType, b: ProductType) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
      default:
        return createdTime(b) - createdTime(a);
    }
  };

  return [...products].sort(
    (a, b) => Number(isArchived(a)) - Number(isArchived(b)) || byOrder(a, b)
  );
}

/** How many filters differ from the defaults (shown on the mobile FILTER button). */
export function activeFilterCount(filters: FilterOptions): number {
  let n = 0;
  if (filters.category) n++;
  n += filters.sizes.length;
  n += filters.stockStatus.length;
  if (filters.priceRange[0] > 0 || Number.isFinite(filters.priceRange[1])) n++;
  if (!filters.showArchived) n++;
  return n;
}
