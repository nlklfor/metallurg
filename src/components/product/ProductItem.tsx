import type { ProductType } from "@/interfaces";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import { availableSizes, compareSizes, totalStock } from "@/utils/filterUtils";

interface ProductItemProps {
  product: ProductType;
  variant?: "light" | "dark";
}

// Inventory card (design file: Inventory-D / Inventory-M, Components).
// Square photo slot on white, status tags top-left, object number top-right,
// on hover (desktop): border goes black, second photo cross-fades in and a
// black SIZES strip shows units per size. Sold-out objects are ARCHIVED:
// stamped, greyed, not clickable.
export default function ProductItem({ product, variant = "light" }: ProductItemProps) {
  const currency = useCurrencyStore((state) => state.currency);
  const isDark = variant === "dark";
  const isArchived = product.stock_status === "out_of_stock";
  const isPreOrder = product.stock_status === "pre_order";
  const left = totalStock(product);
  const isLow = !isArchived && left > 0 && left <= 2;
  const sizes = availableSizes(product).sort(compareSizes);
  const stockMap = product.size_stock ?? {};
  const hasStockMap = Object.keys(stockMap).length > 0;
  const objectNo = product.sku ? product.sku.replace(/\D/g, "").slice(-3) : "";
  const secondImage = product.image_url[1];

  const sizesLabel = isArchived ? "ARCHIVED" : sizes.length > 0 ? sizes.join(" · ") : "ONE_SIZE";

  const card = (
    <article
      className={cn(
        "group/card flex h-full flex-col border transition-colors duration-200 ease-mtl",
        isDark
          ? "border-rule-dark bg-transparent text-paper hover:border-paper"
          : "border-rule bg-transparent text-ink",
        !isDark && !isArchived && "hover:border-ink"
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-contain p-[6%] transition-opacity duration-200 ease-mtl",
            secondImage && !isArchived && "md:group-hover/card:opacity-0",
            isArchived && "opacity-40 grayscale"
          )}
        />
        {secondImage && !isArchived && (
          <img
            src={secondImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 hidden h-full w-full object-contain p-[6%] opacity-0 transition-opacity duration-200 ease-mtl md:block md:group-hover/card:opacity-100"
          />
        )}

        <div className="absolute left-1.5 top-1.5 z-10 flex flex-wrap gap-1.5 sm:left-2.5 sm:top-2.5">
          {isPreOrder && (
            <span className="border border-status-info bg-paper px-1.5 py-0.5 text-[8px] tracking-[0.12em] text-[#1D4ED8] sm:text-[9px] sm:tracking-[0.15em]">
              PRE_ORDER
            </span>
          )}
          {isLow && (
            <span className="bg-status-low px-1.5 py-[3px] text-[8px] font-bold tracking-[0.12em] text-ink sm:text-[9px] sm:tracking-[0.15em]">
              LAST_{left}
            </span>
          )}
          {product.is_new && !isArchived && (
            <span className="border border-ink bg-paper px-1.5 py-0.5 text-[8px] tracking-[0.12em] text-ink sm:text-[9px] sm:tracking-[0.15em]">
              NEW
            </span>
          )}
        </div>

        {objectNo && (
          <span className="absolute right-3 top-3 hidden text-[9px] tracking-[0.15em] text-dim-dark sm:block">
            {objectNo}
          </span>
        )}

        {isArchived && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] border-2 border-ink bg-paper px-2 py-1 text-[10px] font-bold tracking-[0.3em] text-ink sm:px-3.5 sm:py-1.5 sm:text-[13px] sm:tracking-[0.35em]">
            ARCHIVED
          </span>
        )}

        {!isArchived && sizes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full items-center gap-3.5 bg-ink px-3 py-2.5 text-[12px] text-paper transition-transform duration-200 ease-mtl md:flex md:group-hover/card:translate-y-0">
            <span className="text-[9px] tracking-[0.2em] text-dim-dark">SIZES</span>
            {sizes.map((s) => {
              const n = hasStockMap ? (stockMap[s] ?? 0) : null;
              return (
                <span key={s} className="flex items-baseline gap-1">
                  {s}
                  {n !== null && n <= 2 && (
                    <span className="text-[10px] text-status-low">·{n}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 border-t p-2.5 sm:gap-2 sm:px-4 sm:py-3.5",
          isDark ? "border-rule-dark" : "border-rule",
          isArchived && "text-dim"
        )}
      >
        <h3 className="display line-clamp-3 text-[14px] leading-[1.02] sm:text-[18px] sm:leading-none">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
          <span className="text-[12px] font-semibold sm:text-[14px]">
            {formatPrice(product.price, currency)}
          </span>
          <span
            className={cn(
              "truncate text-[9px] tracking-[0.1em] sm:text-[10px]",
              isDark ? "text-dim-dark" : "text-dim"
            )}
          >
            {sizesLabel}
          </span>
        </div>
      </div>
    </article>
  );

  if (isArchived) {
    return (
      <div aria-label={`${product.name}, archived`} className="h-full cursor-not-allowed">
        {card}
      </div>
    );
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {card}
    </Link>
  );
}
