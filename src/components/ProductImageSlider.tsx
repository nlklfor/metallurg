import type { ProductImageSliderProps } from "@/interfaces/product";
import { useRef, useState, useEffect, useCallback } from "react";

export default function ProductImageSlider({
  images,
  productName,
  isOutOfStock = false,
}: ProductImageSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: index * el.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="relative flex gap-3 h-[300px] sm:h-[420px] lg:h-[520px]">
      <div className="flex flex-col justify-center gap-2 py-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group flex items-center"
            aria-label={`Go to image ${i + 1}`}
          >
            <span
              className="block transition-all duration-300 rounded-full"
              style={{
                width: "2px",
                height: i === activeIndex ? "32px" : "12px",
                backgroundColor:
                  i === activeIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                transitionProperty: "height, background-color",
              }}
            />
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            className="snap-start snap-always w-full h-full relative overflow-hidden bg-zinc-950"
          >
            <img
              src={url}
              alt={`${productName} — view ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-transform duration-700 ${
                isOutOfStock ? "grayscale blur-[1px]" : "hover:scale-[1.03]"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)" }}
              loading={idx === 0 ? "eager" : "lazy"}
            />

            <div
              className="absolute bottom-4 right-4 text-[9px] tracking-widest tabular-nums"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>

            {isOutOfStock && idx === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white font-black text-2xl md:text-3xl uppercase tracking-[0.3em] opacity-60">
                  OUT_OF_STOCK
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
