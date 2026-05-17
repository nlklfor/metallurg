import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductType } from "@/interfaces";
import ProductItem from "@/components/product/ProductItem";

interface Props {
  products: ProductType[];
  variant?: "dark" | "light";
}

export default function RelatedProductsSlider({ products, variant = "dark" }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  return (
    <div className="relative group">
      <button
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Scroll left"
        className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-5 z-10 w-9 h-9 flex items-center justify-center border border-gray-700 bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {products.map((p) => (
            <div key={p.id} className="flex-none w-[240px]">
              <ProductItem product={p} variant={variant} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Scroll right"
        className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-5 z-10 w-9 h-9 flex items-center justify-center border border-gray-700 bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
