import type { ProductImageSliderProps } from "@/interfaces/product";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function Lightbox({
  images,
  productName,
  startIndex,
  onClose,
}: {
  images: string[];
  productName: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 text-zinc-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <span className="absolute top-5 left-5 text-[9px] font-ibm-mono text-zinc-600 tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </span>

      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`${productName} — view ${current + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </motion.div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "20px" : "6px",
                height: "2px",
                backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ProductImageSlider({
  images,
  productName,
  isOutOfStock = false,
}: ProductImageSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
    <>
      <div className="relative flex gap-3 h-[300px] sm:h-[420px] lg:h-[600px] xl:h-[700px]">
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
                onClick={() => !isOutOfStock && setLightboxOpen(true)}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className={`absolute inset-0 w-full h-full object-contain transition-transform duration-700 ${
                  isOutOfStock ? "grayscale blur-[1px]" : "hover:scale-[1.03] cursor-zoom-in"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)" }}
                loading={idx === 0 ? "eager" : "lazy"}
              />

              <img
                src="https://ytynsqcxteyufoynvsir.supabase.co/storage/v1/object/public/product-image/mtl-logo-transparent.png"
                alt=""
                aria-hidden="true"
                className="absolute bottom-10 right-3 z-10 w-10 h-10 opacity-20 pointer-events-none select-none object-contain"
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

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            productName={productName}
            startIndex={activeIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
