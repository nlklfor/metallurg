export interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (updates: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

export interface FilterOptions {
  sortBy: "price-asc" | "price-desc" | "newest";
  sizes: string[];
  priceRange: [number, number];
}
