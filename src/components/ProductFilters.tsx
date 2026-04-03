import type { FilterOptions, ProductFiltersProps } from "@/interfaces";
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
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "./ui/button";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";

export default function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [localPrice, setLocalPrice] = useState<number>(filters.priceRange[1]);
  const debouncedPrice = useDebounce(localPrice, 500);
  const prevDebouncedPrice = useRef(debouncedPrice);
  const currency = useCurrencyStore((state) => state.currency);

  const handleSortChange = (value: FilterOptions["sortBy"]) => {
    onFilterChange({ sortBy: value });
  };

  const handlePriceChange = (value: number[]) => {
    setLocalPrice(value[0]);
  };

  const handleClearFilters = () => {
    setLocalPrice(filters.priceRange[1]);
    onClearFilters();
  };

  useEffect(() => {
    if (prevDebouncedPrice.current !== debouncedPrice) {
      prevDebouncedPrice.current = debouncedPrice;
      onFilterChange({ priceRange: [0, debouncedPrice] });
    }
  }, [debouncedPrice, onFilterChange]);

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
          {formatPrice(localPrice, currency)}
        </span>
      </div>

      <Button
        onClick={handleClearFilters}
        variant="outline"
        className="ml-auto px-5 py-2 border border-black bg-transparent hover:bg-black text-black hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-all duration-200 rounded-none"
      >
        Clear Filters
      </Button>
    </div>
  );
}
