import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Slider as SliderPrimitive } from "radix-ui";
import type { FilterOptions, ProductFiltersProps } from "@/interfaces";
import { cn } from "@/lib/utils";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { useDebounce } from "@/hooks/useDebounce";
import { activeFilterCount } from "@/utils/filterUtils";
import { formatPrice, useCurrencyStore } from "@/stores/useCurrencyStore";

// Inventory filters (design file: Inventory-D sidebar, Inventory-M toolbar,
// InventoryStates 01 filter sheet). Filters apply live; the sheet's CTA shows
// how many objects match before closing.

type Category = NonNullable<FilterOptions["category"]>;
type Availability = FilterOptions["stockStatus"][number];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "footwear", label: "FOOTWEAR" },
  { value: "apparel", label: "APPAREL" },
  { value: "accessories", label: "ACCESSORIES" },
];

const AVAILABILITY: { value: Availability; label: string; dot: string }[] = [
  { value: "in_stock", label: "IN_STOCK", dot: "bg-status-ok" },
  { value: "pre_order", label: "PRE_ORDER", dot: "bg-status-info" },
];

const SORTS: { value: FilterOptions["sortBy"]; label: string }[] = [
  { value: "newest", label: "NEWEST" },
  { value: "price-asc", label: "PRICE ↑" },
  { value: "price-desc", label: "PRICE ↓" },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow text-[10px] text-dim">{children}</p>;
}

/** Square check indicator used by category / availability rows. */
function Check({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 flex-shrink-0 border transition-colors duration-150",
        on ? "border-ink bg-ink" : disabled ? "border-[#D1D5DB]" : "border-ink"
      )}
    />
  );
}

// ─── Price range ────────────────────────────────────────────────────────────

function PriceRange({
  filters,
  onFilterChange,
  bounds,
}: Pick<ProductFiltersProps, "filters" | "onFilterChange"> & { bounds: [number, number] }) {
  const currency = useCurrencyStore((s) => s.currency);
  const clamp = (range: [number, number]): [number, number] => [
    Math.max(bounds[0], Math.min(range[0], bounds[1])),
    Math.min(bounds[1], Math.max(range[1], bounds[0])),
  ];
  const [local, setLocal] = useState<[number, number]>(() => clamp(filters.priceRange));
  const debounced = useDebounce(local, 300);

  // Follow outside changes (reset, catalog bounds arriving after load).
  const [lo, hi] = filters.priceRange;
  useEffect(() => {
    setLocal(clamp([lo, hi]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi, bounds[0], bounds[1]]);

  useEffect(() => {
    const [a, b] = debounced;
    const open: [number, number] = [
      a <= bounds[0] ? 0 : a,
      b >= bounds[1] ? Number.POSITIVE_INFINITY : b,
    ];
    if (open[0] !== filters.priceRange[0] || open[1] !== filters.priceRange[1]) {
      onFilterChange({ priceRange: open });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>// PRICE_RANGE</Eyebrow>
      <SliderPrimitive.Root
        min={bounds[0]}
        max={bounds[1]}
        step={100}
        minStepsBetweenThumbs={1}
        value={local}
        onValueChange={(v) => setLocal([v[0], v[1]])}
        className="relative flex h-7 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-px grow bg-rule">
          <SliderPrimitive.Range className="absolute -top-px h-[3px] bg-ink" />
        </SliderPrimitive.Track>
        {(["min", "max"] as const).map((k) => (
          <SliderPrimitive.Thumb
            key={k}
            aria-label={k === "min" ? "Minimum price" : "Maximum price"}
            className="block h-5 w-5 border-2 border-ink bg-paper transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:h-4 lg:w-4"
          />
        ))}
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[11px] tabular-nums">
        <span>{formatPrice(local[0], currency)}</span>
        <span>{formatPrice(local[1], currency)}</span>
      </div>
    </div>
  );
}

// ─── Shared panel (sidebar + sheet) ─────────────────────────────────────────

interface PanelProps extends ProductFiltersProps {
  layout: "sidebar" | "sheet";
}

function FilterPanel({
  layout,
  filters,
  onFilterChange,
  onClearFilters,
  facets,
  resultCount,
}: PanelProps) {
  const isSheet = layout === "sheet";

  const toggleSize = (s: string) =>
    onFilterChange({
      sizes: filters.sizes.includes(s)
        ? filters.sizes.filter((x) => x !== s)
        : [...filters.sizes, s],
    });

  const toggleAvailability = (v: Availability) =>
    onFilterChange({
      stockStatus: filters.stockStatus.includes(v)
        ? filters.stockStatus.filter((x) => x !== v)
        : [...filters.stockStatus, v],
    });

  return (
    <div className={cn("flex flex-col text-[12px]", isSheet ? "gap-6" : "gap-7")}>
      {/* CATEGORY */}
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// CATEGORY</Eyebrow>
        {isSheet ? (
          <div className="grid h-11 grid-cols-3 border border-ink text-[10px] tracking-[0.1em]">
            {CATEGORIES.map((c, i) => {
              const on = filters.category === c.value;
              const empty = facets.categoryCounts[c.value] === 0;
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={on}
                  disabled={empty && !on}
                  onClick={() => onFilterChange({ category: on ? null : c.value })}
                  className={cn(
                    "transition-colors duration-150",
                    i > 0 && "border-l border-ink",
                    on ? "bg-ink text-paper" : empty ? "text-dim-dark" : "hover:bg-[#F3F4F6]"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : (
          CATEGORIES.map((c) => {
            const on = filters.category === c.value;
            const count = facets.categoryCounts[c.value];
            const empty = count === 0;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                disabled={empty && !on}
                onClick={() => onFilterChange({ category: on ? null : c.value })}
                className={cn(
                  "flex h-8 items-center gap-2.5 text-left transition-colors duration-150",
                  empty && !on ? "cursor-not-allowed text-dim-dark" : "hover:text-dim"
                )}
              >
                <Check on={on} disabled={empty} />
                {c.label}
                <span className="ml-auto tabular-nums text-dim-dark">{pad2(count)}</span>
              </button>
            );
          })
        )}
      </div>

      {/* SIZE */}
      {facets.sizes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <Eyebrow>// SIZE_EU</Eyebrow>
          <div className={cn("grid gap-1.5", isSheet ? "grid-cols-6" : "grid-cols-4")}>
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSize(s)}
                  className={cn(
                    "border text-[12px] transition-colors duration-150",
                    isSheet ? "h-11 text-[13px]" : "h-10",
                    on ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PRICE */}
      <PriceRange filters={filters} onFilterChange={onFilterChange} bounds={facets.priceBounds} />

      {/* AVAILABILITY */}
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// AVAILABILITY</Eyebrow>
        {isSheet ? (
          <div className="flex flex-wrap gap-2">
            {[
              ...AVAILABILITY,
              { value: "archived" as const, label: "SHOW_ARCHIVED", dot: "bg-dim-dark" },
            ].map((a) => {
              const on =
                a.value === "archived"
                  ? filters.showArchived
                  : filters.stockStatus.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    a.value === "archived"
                      ? onFilterChange({ showArchived: !filters.showArchived })
                      : toggleAvailability(a.value)
                  }
                  className={cn(
                    "flex h-11 items-center gap-2 border px-3.5 text-[11px] tracking-[0.1em] transition-colors duration-150",
                    on ? "border-ink bg-ink text-paper" : "border-rule"
                  )}
                >
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5", a.dot)} />
                  {a.label}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {AVAILABILITY.map((a) => {
              const on = filters.stockStatus.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleAvailability(a.value)}
                  className="flex h-8 items-center gap-2.5 text-left hover:text-dim"
                >
                  <Check on={on} />
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5", a.dot)} />
                  {a.label}
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={filters.showArchived}
              onClick={() => onFilterChange({ showArchived: !filters.showArchived })}
              className="flex h-8 items-center gap-2.5 text-left hover:text-dim"
            >
              <Check on={filters.showArchived} />
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-dim-dark" />
              SHOW_ARCHIVED
            </button>
          </>
        )}
      </div>

      {/* SORT */}
      {isSheet ? (
        <div className="flex flex-col gap-2.5">
          <Eyebrow>// SORT</Eyebrow>
          <div className="flex flex-col" role="radiogroup" aria-label="Sort">
            {SORTS.map((s) => {
              const on = filters.sortBy === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onFilterChange({ sortBy: s.value })}
                  className="flex h-10 items-center gap-2.5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={cn("h-3 w-3 border border-ink", on && "bg-ink")}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Eyebrow>// SORT</Eyebrow>
          <SortSelect value={filters.sortBy} onChange={(v) => onFilterChange({ sortBy: v })} />
          {activeFilterCount(filters) > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-1 h-11 self-start text-[11px] tracking-[0.15em] underline underline-offset-[5px] hover:text-dim"
            >
              RESET_FILTERS ({pad2(resultCount)} SHOWN)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sort select (native, styled) ───────────────────────────────────────────

function SortSelect({
  value,
  onChange,
  prefix = "",
  className,
}: {
  value: FilterOptions["sortBy"];
  onChange: (v: FilterOptions["sortBy"]) => void;
  prefix?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FilterOptions["sortBy"])}
        className="h-11 w-full cursor-pointer appearance-none rounded-none border border-ink bg-paper pl-3 pr-8 text-[11px] tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink max-sm:tracking-[0.04em]"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {prefix}
            {s.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
      >
        ▾
      </span>
    </label>
  );
}

// ─── Desktop sidebar ────────────────────────────────────────────────────────

/** Sidebar while products load: same sections and rhythm, no fake "00" counts. */
function FilterSidebarSkeleton() {
  const bar = "bg-[#F3F4F6]";
  const rows = (n: number, h = "h-8") =>
    Array.from({ length: n }).map((_, i) => (
      <div key={i} className={cn("flex items-center gap-2.5", h)}>
        <span className="h-3.5 w-3.5 border border-rule" />
        <span className={cn("h-3 w-24", bar)} />
      </div>
    ));
  return (
    <div className="flex flex-col gap-7 text-[12px]" aria-hidden="true">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// CATEGORY</Eyebrow>
        <div className="flex flex-col">{rows(3)}</div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// SIZE_EU</Eyebrow>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-10 border border-rule" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Eyebrow>// PRICE_RANGE</Eyebrow>
        <div className={cn("h-[3px] w-full", bar)} />
        <div className="flex justify-between">
          <span className={cn("h-3 w-14", bar)} />
          <span className={cn("h-3 w-14", bar)} />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// AVAILABILITY</Eyebrow>
        <div className="flex flex-col">{rows(3)}</div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Eyebrow>// SORT</Eyebrow>
        <div className="h-11 border border-rule" />
      </div>
    </div>
  );
}

export function FilterSidebar(props: ProductFiltersProps) {
  if (props.isLoading) return <FilterSidebarSkeleton />;
  return <FilterPanel layout="sidebar" {...props} />;
}

// ─── Mobile toolbar + sheet ─────────────────────────────────────────────────

export function MobileFilterBar(props: ProductFiltersProps) {
  const { filters, onFilterChange, onClearFilters, facets, resultCount, isLoading } = props;
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-2.5 border-b border-rule px-4 pb-4 sm:px-8">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="flex h-11 items-center gap-2 bg-ink px-3.5 text-[11px] tracking-[0.15em] text-paper"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            FILTER{active > 0 ? ` [ ${active} ]` : ""}
          </button>
          <SortSelect
            value={filters.sortBy}
            onChange={(v) => onFilterChange({ sortBy: v })}
            prefix="SORT: "
            className="flex-1 [&_select]:border-rule"
          />
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            aria-pressed={filters.category === null}
            onClick={() => onFilterChange({ category: null })}
            className={cn(
              "h-9 flex-shrink-0 border px-3 text-[10px] tracking-[0.15em] transition-colors duration-150",
              filters.category === null ? "border-ink bg-ink text-paper" : "border-rule"
            )}
          >
            ALL
          </button>
          {CATEGORIES.map((c) => {
            const on = filters.category === c.value;
            const count = facets.categoryCounts[c.value];
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                disabled={(count === 0 || isLoading) && !on}
                onClick={() => onFilterChange({ category: on ? null : c.value })}
                className={cn(
                  "h-9 flex-shrink-0 border px-3 text-[10px] tracking-[0.15em] transition-colors duration-150",
                  on ? "border-ink bg-ink text-paper" : "border-rule",
                  count === 0 && !on && !isLoading && "text-dim-dark"
                )}
              >
                {c.label} {isLoading ? "--" : pad2(count)}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[70] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <motion.div
              className="absolute inset-0 bg-ink/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.page }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex h-[85%] flex-col border-t border-ink bg-paper font-mono text-ink"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: DURATION.modal, ease: EASE_MTL }}
            >
              <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-rule px-4">
                <span className="eyebrow">// FILTER_PARAMS</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 text-[11px] tracking-[0.15em]"
                >
                  [ CLOSE ]
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <FilterPanel layout="sheet" {...props} />
              </div>
              <div
                className="flex flex-shrink-0 gap-2 border-t border-rule px-4 pt-3"
                style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
              >
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="h-[52px] border border-ink px-4 text-[11px] tracking-[0.15em]"
                >
                  RESET
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-[52px] flex-1 bg-ink text-[12px] font-bold tracking-[0.15em] text-paper"
                >
                  SHOW {pad2(resultCount)} {resultCount === 1 ? "OBJECT" : "OBJECTS"} →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
