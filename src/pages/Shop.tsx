import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductList from "@/components/product/ProductList";
import { FilterSidebar, MobileFilterBar } from "@/components/product/ProductFilters";
import { useFilters } from "@/hooks/useFilters";
import { useProductList } from "@/hooks/useProductList";
import { filterProducts, getCatalogFacets } from "@/utils/filterUtils";
import Seo from "@/components/seo/Seo";

const pad2 = (n: number) => String(n).padStart(2, "0");

function RequestCard({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/contact"
      className={`group flex flex-col gap-2 border border-ink p-4 transition-colors duration-200 hover:bg-ink hover:!text-paper ${className}`}
    >
      <span className="eyebrow text-[10px] text-dim group-hover:text-dim-dark">
        // NOT_IN_ARCHIVE?
      </span>
      <span className="display text-[20px]">Request object →</span>
    </Link>
  );
}

// Inventory (design file: Inventory-D / Inventory-M / InventoryStates).
export default function Shop() {
  const { filters, updateFilters, clearFilters } = useFilters();
  const { products, isLoading, error } = useProductList();

  const facets = useMemo(() => getCatalogFacets(products), [products]);
  const visible = useMemo(() => filterProducts(products, filters), [products, filters]);

  const filterProps = {
    filters,
    onFilterChange: updateFilters,
    onClearFilters: clearFilters,
    facets,
    resultCount: visible.length,
    isLoading,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-mono text-ink">
      <Seo />
      <Navbar variant="light" />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Inventory" }]} />
      </div>

      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">Inventory</h1>
        <div className="h-px bg-ink" />
        <p className="text-[12px] leading-relaxed lg:text-[13px]">
          Verified objects. Pre-order units ship 10–14 days.
        </p>
      </header>

      <div className="lg:hidden">
        <MobileFilterBar {...filterProps} />
        <p className="px-4 py-3 text-[10px] tracking-[0.15em] text-dim sm:px-8">
          {isLoading ? "--" : pad2(visible.length)}{" "}
          {visible.length === 1 && !isLoading ? "OBJECT" : "OBJECTS"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 px-4 sm:px-8 md:px-12 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-7 lg:flex" aria-label="Filters">
          <FilterSidebar {...filterProps} />
          <RequestCard />
        </aside>

        <section className="flex min-w-0 flex-col gap-4" aria-label="Objects">
          <p className="hidden h-5 text-[10px] tracking-[0.15em] text-dim lg:block">
            {isLoading ? "--" : pad2(visible.length)}{" "}
            {visible.length === 1 && !isLoading ? "OBJECT" : "OBJECTS"}
          </p>
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
