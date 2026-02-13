import { useState } from "react";
import type { FilterOptions } from "@/interfaces";
import { DEFAULT_FILTERS } from "@/lib/constants";

export function useFilters() {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return { filters, updateFilters, clearFilters };
}
