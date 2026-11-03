import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductType } from "@/interfaces";
import ProductItem from "@/components/product/ProductItem";
import { cn } from "@/lib/utils";

interface Props {
  products: ProductType[];
  variant?: "dark" | "light";
}

// "You may also like" (design file: Object-D / Object-M). 4-up on desktop,
// swipe on mobile; arrows sit next to the heading.
export default function RelatedProductsSlider({ products, variant = "dark" }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const isDark = variant === "dark";

  const update = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // First read on the next frame (embla may have initialised already).
    const frame = requestAnimationFrame(update);
    emblaApi.on("select", update).on("reInit", update).on("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", update).off("reInit", update).off("scroll", update);
    };
  }, [emblaApi, update]);

  const arrow = (dir: "prev" | "next") => {
    const enabled = dir === "prev" ? canPrev : canNext;
    return (
      <button
        type="button"
        onClick={() => (dir === "prev" ? emblaApi?.scrollPrev() : emblaApi?.scrollNext())}
        disabled={!enabled}
        aria-label={dir === "prev" ? "Previous objects" : "Next objects"}
        className={cn(
          "flex h-11 w-11 items-center justify-center border text-[14px] transition-colors duration-150",
          enabled
            ? isDark
              ? "border-paper hover:bg-paper hover:text-ink"
              : "border-ink hover:bg-ink hover:text-paper"
            : "cursor-not-allowed border-[#374151] text-[#4B5563]"
        )}
      >
        {dir === "prev" ? "←" : "→"}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex items-end justify-between gap-4 pr-4 sm:pr-0">
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <h2 className="display text-[28px] lg:text-[44px]">You may also like</h2>
        </div>
        <div className="hidden gap-2 lg:flex">
          {arrow("prev")}
          {arrow("next")}
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2.5 lg:gap-5">
          {products.map((p) => (
            <div key={p.id} className="w-[160px] flex-none sm:w-[200px] lg:w-[260px]">
              <ProductItem product={p} variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
