import type { FilterOptions } from "@/interfaces";

export const DEFAULT_FILTERS: FilterOptions = {
  sortBy: "newest",
  sizes: [],
  // Upper bound is open until the visitor moves the slider; the UI clamps it to
  // the real price range of the catalog.
  priceRange: [0, Number.POSITIVE_INFINITY],
  category: null,
  stockStatus: [],
  showArchived: true,
};
