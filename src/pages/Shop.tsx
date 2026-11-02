import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductList from "@/components/product/ProductList";
import { FilterSidebar, MobileFilterBar } from "@/components/product/ProductFilters";
import { useFilters } from "@/hooks/useFilters";
import { useProductList } from "@/hooks/useProductList";
import { filterProducts, getCatalogFacets } from "@/utils/filterUtils";
import { useCurrencyStore } from "@/stores/useCurrencyStore";

const pad2 = (n: number) => String(n).padStart(2, "0");

function formatSync(products: { created_at?: string; createdAt?: string }[]): string | null {
  const times = products
    .map((p) => new Date(p.created_at ?? p.createdAt ?? "").getTime())
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) return null;
  const d = new Date(Math.max(...times));
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function RequestCard({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/contact"
      className={`group flex flex-col gap-2 border border-ink p-4 transition-colors duration-200 hover:bg-ink hover:!text-paper ${className}`}
    >
      <span className="eyebrow text-[9px] text-dim group-hover:text-dim-dark">
        // NOT_IN_ARCHIVE?
      </span>
      <span className="display text-[20px] lg:text-[20px]">Request object</span>
      <span className="text-[10px] tracking-[0.12em]">SOURCING ON REQUEST →</span>
    </Link>
  );
}

// Inventory (design file: Inventory-D / Inventory-M / InventoryStates).
export default function Shop() {
  const { filters, updateFilters, clearFilters } = useFilters();
  const { products, isLoading, error } = useProductList();
  const currency = useCurrencyStore((s) => s.currency);

  const facets = useMemo(() => getCatalogFacets(products), [products]);
  const visible = useMemo(() => filterProducts(products, filters), [products, filters]);
  const live = products.filter((p) => p.stock_status !== "out_of_stock").length;
  const lastSync = formatSync(products);

  const filterProps = {
    filters,
    onFilterChange: updateFilters,
    onClearFilters: clearFilters,
    facets,
    resultCount: visible.length,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-mono text-ink">
      <Navbar variant="light" />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Inventory" }]} />
      </div>

      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <p className="eyebrow text-[9px] text-dim lg:text-[10px]">// CATALOG_V2.0</p>
        <div className="flex items-end justify-between gap-6">
          <h1 className="display text-[68px] sm:text-[96px] lg:text-[128px]">Inventory</h1>
          <p className="hidden pb-2 text-right text-[11px] leading-[1.9] tracking-[0.15em] text-dim md:block">
            {isLoading ? (
              <>
                // FETCHING_OBJECTS<span className="animate-blink-cursor text-ink">█</span>
              </>
            ) : (
              <>
                {pad2(live)} OBJECTS INDEXED
                {lastSync && (
                  <>
                    <br />
                    LAST_SYNC {lastSync}
                  </>
                )}
              </>
            )}
          </p>
        </div>
        <div className="h-px bg-ink" />
        <p className="text-[12px] leading-relaxed lg:text-[13px]">
          {isLoading ? (
            <span className="text-dim md:hidden">
              // FETCHING_OBJECTS<span className="animate-blink-cursor text-ink">█</span>
            </span>
          ) : (
            <>
              <span className="md:hidden">{pad2(live)} objects indexed. </span>
              Verified objects. Pre-order units ship 10–14 days.
            </>
          )}
        </p>
      </header>

      <div className="lg:hidden">
        <MobileFilterBar {...filterProps} />
        <div className="flex justify-between px-4 py-3 text-[10px] tracking-[0.15em] text-dim sm:px-8">
          <span>
            {pad2(visible.length)} {visible.length === 1 ? "OBJECT" : "OBJECTS"}
          </span>
          <span>{currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 px-4 sm:px-8 md:px-12 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-7 lg:flex" aria-label="Filters">
          <FilterSidebar {...filterProps} />
          <RequestCard />
        </aside>

        <section className="flex min-w-0 flex-col gap-4" aria-label="Objects">
          <div className="hidden h-5 justify-between text-[10px] tracking-[0.15em] text-dim lg:flex">
            <span>
              SHOWING {pad2(visible.length)} / {pad2(products.length)}
              {filters.sizes.length > 0 && ` · SIZE ${filters.sizes.join(", ")} SELECTED`}
            </span>
            <span>{currency}</span>
          </div>
          <ProductList
            products={visible}
            isLoading={isLoading}
            error={error}
            onResetFilters={clearFilters}
          />
          <RequestCard className="mt-6 lg:hidden" />
        </section>
      </div>

      <div className="h-16" />
      <Footer />
    </div>
  );
}
