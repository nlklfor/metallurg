import type { ProductType } from "@/interfaces";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import { availableSizes, compareSizes } from "@/utils/filterUtils";

interface ProductItemProps {
  product: ProductType;
  variant?: "light" | "dark";
}

// Inventory card (design file: Inventory-D / Inventory-M, Components).
// Kept quiet on purpose: photo, small status tags, name, price. Sizes appear
// only on hover (desktop) in the black SIZES strip. Sold-out objects are
// ARCHIVED: stamped, greyed, not clickable.
export default function ProductItem({ product, variant = "light" }: ProductItemProps) {
  const currency = useCurrencyStore((state) => state.currency);
  const isDark = variant === "dark";
  const isArchived = product.stock_status === "out_of_stock";
  const isPreOrder = product.stock_status === "pre_order";
  const sizes = availableSizes(product).sort(compareSizes);
  const secondImage = product.image_url[1];

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
            <span className="bg-paper/90 px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-[#1D4ED8]">
              PRE_ORDER
            </span>
          )}
          {product.is_new && !isArchived && (
            <span className="bg-paper/90 px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-ink">
              NEW
            </span>
          )}
        </div>

        {isArchived && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] border-2 border-ink bg-paper px-2 py-1 text-[10px] font-bold tracking-[0.15em] text-ink sm:px-3.5 sm:py-1.5 sm:text-[13px] sm:tracking-[0.15em]">
            ARCHIVED
          </span>
        )}

        {!isArchived && sizes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full items-center gap-3.5 bg-ink px-3 py-2.5 text-[12px] text-paper transition-transform duration-200 ease-mtl md:flex md:group-hover/card:translate-y-0">
            <span className="text-[10px] tracking-[0.15em] text-dim-dark">SIZES</span>
            {sizes.map((s) => (
              <span key={s}>{s}</span>
            ))}
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
        <span
          className={cn(
            "mt-auto text-[12px] font-semibold sm:text-[14px]",
            isArchived && "font-normal line-through"
          )}
        >
          {formatPrice(product.price, currency)}
        </span>
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
