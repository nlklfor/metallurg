import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Review, ReviewWithOrderItems } from "@/interfaces/review";
import { timeAgo } from "@/utils";
import { DURATION, EASE_MTL } from "@/lib/motion";

// Field report card (design file: Orders-D / Orders-M).

const blocks = (rating: number) => "█".repeat(rating) + "░".repeat(5 - rating);

function maskName(name: string): string {
  if (name.length <= 3) return name.toUpperCase();
  return (name.slice(0, 3) + "*".repeat(Math.min(name.length - 3, 4))).toUpperCase();
}

export default function ReviewCard({ review }: { review: Review | ReviewWithOrderItems }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const items = "order_items" in review ? (review.order_items ?? []) : [];
  const objects = items.map((i) => i.name).filter(Boolean);
  const images = review.image_urls ?? [];

  useEffect(() => {
    if (!expandedImage) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpandedImage(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedImage]);

  const meta = [
    review.size_purchased && `SIZE_BOUGHT ${review.size_purchased}`,
    maskName(review.author_name),
    "✓ VERIFIED_ORDER",
  ].filter(Boolean);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.page, ease: EASE_MTL }}
        className="flex flex-col gap-3 border border-rule p-3.5 lg:p-5"
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[13px] tracking-[0.08em] lg:text-[14px]"
            aria-label={`${review.rating} out of 5`}
          >
            {blocks(review.rating)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-dim">
            {timeAgo(review.created_at)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {objects.length > 0 && (
            <span className="display text-[16px] leading-none lg:text-[18px]">
              {objects.join(" / ")}
            </span>
          )}
          <span className="text-[10px] tracking-[0.12em] text-dim">{meta.join(" / ")}</span>
        </div>

        {review.body && (
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[#374151] lg:text-[13px]">
            {review.body}
          </p>
        )}

        {images.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setExpandedImage(url)}
                aria-label={`Open photo ${i + 1}`}
                className="h-16 w-16 overflow-hidden border border-rule transition-colors hover:border-ink lg:h-[72px] lg:w-[72px]"
              >
                <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.article>

      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report photo"
          className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DURATION.page, ease: EASE_MTL }}
            src={expandedImage}
            alt="Report photo"
            className="max-h-[85vh] max-w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setExpandedImage(null)}
            className="absolute right-5 top-5 h-11 text-[11px] tracking-[0.15em] text-dim-dark hover:text-paper"
          >
            [ESC]
          </button>
        </div>
      )}
    </>
  );
}
