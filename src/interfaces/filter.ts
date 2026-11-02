import type { CatalogFacets } from "@/utils/filterUtils";

export interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (updates: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  facets: CatalogFacets;
  /** Objects matching the current filters (live count on the sheet CTA). */
  resultCount: number;
}

export interface FilterOptions {
  sortBy: "price-asc" | "price-desc" | "newest";
  sizes: string[];
  priceRange: [number, number];
  category: "apparel" | "footwear" | "accessories" | null;
  stockStatus: ("in_stock" | "pre_order")[];
  /** Show sold-out (archived) objects at the end of the grid. */
  showArchived: boolean;
}
