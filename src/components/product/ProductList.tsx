import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import type { ProductType } from "@/interfaces";
import { DURATION, EASE_MTL, staggerDelay } from "@/lib/motion";
import ProductItem from "./ProductItem";
import ProductSkeleton from "./ProductSkeleton";

interface ProductListProps {
  products: ProductType[];
  isLoading: boolean;
  error: string | null;
  onResetFilters: () => void;
}

const GRID = "grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5";

// Inventory grid: 2-up on phones, 3-up next to the desktop sidebar.
// States from the design file (InventoryStates): skeleton, empty result.
export default function ProductList({
  products,
  isLoading,
  error,
  onResetFilters,
}: ProductListProps) {
  const reduce = useReducedMotion();

  if (isLoading)
    return (
      <ul className={GRID} aria-busy="true" aria-label="Loading objects">
        {Array.from({ length: 6 }).map((_, idx) => (
          <li key={idx}>
            <ProductSkeleton />
          </li>
        ))}
      </ul>
    );

  if (error)
    return (
      <div className="flex flex-col items-start gap-3 border border-status-error p-5 text-[12px]">
        <p className="eyebrow text-status-error">// status: ERROR</p>
        <p>Could not load the archive: {error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
        >
          RETRY →
        </button>
      </div>
    );

  if (products.length === 0)
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-20 text-center sm:px-8">
        <p aria-hidden="true" className="text-[12px] tracking-[0.3em] text-dim-dark">
          ░░░░░░░░░░
        </p>
        <p className="eyebrow text-dim">// QUERY_RESULT</p>
        <h2 className="display text-[40px]">No_units_found</h2>
        <p className="max-w-[300px] text-[12px] leading-relaxed text-[#374151]">
          Nothing in the archive matches these parameters. We can source it for you.
        </p>
        <Link
          to="/contact"
          className="mt-2 flex h-[52px] w-full max-w-[326px] items-center justify-center bg-ink text-[12px] font-bold tracking-[0.15em] !text-paper transition-colors hover:bg-[#222]"
        >
          REQUEST_OBJECT →
        </Link>
        <button
          type="button"
          onClick={onResetFilters}
          className="h-11 text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
        >
          RESET_FILTERS
        </button>
      </div>
    );

  return (
    <ul className={GRID}>
      {products.map((product, i) => (
        <motion.li
          key={product.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION.page,
            ease: EASE_MTL,
            delay: reduce ? 0 : staggerDelay(i) / 2,
          }}
        >
          <ProductItem product={product} />
        </motion.li>
      ))}
    </ul>
  );
}
