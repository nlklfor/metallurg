import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductList from "@/components/ProductList";
import ProductFilters from "@/components/ProductFilters";
import { useFilters } from "@/hooks/useFilters";

export default function Shop() {
  const { filters, updateFilters, clearFilters } = useFilters();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />
      <div className="px-8 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Inventory" }]} />
      </div>
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-3">
              // CATALOG_V2.0
            </p>
            <h2 className="text-6xl font-black text-black uppercase tracking-tighter italic">
              Inventory
            </h2>
          </div>
          <p className="text-[10px] text-gray-300 tracking-[0.3em] uppercase hidden md:block">
            METALLURG™ — COLLECTION_2026
          </p>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Indexed objects from private archives and limited releases. Each item authenticated,
            verified, and ready for acquisition through encrypted channels.
          </p>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
      />
      <ProductList filters={filters} />

      <Footer />
    </div>
  );
}
