import type { FilterOptions } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "./ui/slider";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (updates: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [localPrice, setLocalPrice] = useState<number>(filters.priceRange[1]);
  const debouncedPrice = useDebounce(localPrice, 500);

  const handleSortChange = (value: FilterOptions["sortBy"]) => {
    onFilterChange({ sortBy: value });
  };

  const handlePriceChange = (value: number[]) => {
    setLocalPrice(value[0]);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  useEffect(() => {
    onFilterChange({ priceRange: [0, debouncedPrice] });
  }, [debouncedPrice]);

  return (
    <div className="px-8 py-6 border-b border-gray-200 flex items-center gap-4">
      <Select value={filters.sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select a sort option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort By</SelectLabel>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-3">
        <Slider
          value={[localPrice]}
          onValueChange={handlePriceChange}
          max={50000}
          min={0}
          step={1000}
          className="w-40"
        />
        <span className="text-sm font-medium whitespace-nowrap">
          UAH {filters.priceRange[1]}
        </span>
      </div>

      <button
        onClick={handleClearFilters}
        className="ml-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition"
      >
        Clear Filters
      </button>
    </div>
  );
}
