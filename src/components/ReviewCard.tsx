import { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import type { Review, ReviewWithOrderItems } from "@/interfaces/review";
import { timeAgo } from "@/utils";

function RatingBlocks({ rating }: { rating: number }) {
  return (
    <span className="font-ibm-mono text-xs tracking-[0.15em]">
      {"█".repeat(rating)}
      {"░".repeat(5 - rating)}
    </span>
  );
}

export default function ReviewCard({ review }: { review: Review | ReviewWithOrderItems }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const orderItems = "order_items" in review ? review.order_items : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-zinc-800 bg-zinc-950/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white flex items-center justify-center">
              <span className="text-[10px] font-archivo-black text-black leading-none">
                {review.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-archivo-black text-white uppercase tracking-wider">
                {review.author_name}
              </p>
              <p className="text-[8px] font-ibm-mono text-zinc-600 tracking-[0.3em] uppercase">
                VERIFIED_PURCHASE
              </p>
              {orderItems.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {orderItems.map((item, i) => (
                    <p
                      key={i}
                      className="text-[8px] font-ibm-mono text-zinc-500 tracking-[0.2em] uppercase"
                    >
                      → {item.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <RatingBlocks rating={review.rating} />
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.2em] mt-0.5">
              {timeAgo(review.created_at)}
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          {review.size_purchased && (
            <p className="text-[8px] font-ibm-mono text-zinc-600 tracking-[0.3em] uppercase mb-2">
              SIZE: {review.size_purchased}
            </p>
          )}
          {review.body && (
            <p className="text-sm text-zinc-400 leading-relaxed font-ibm-mono">{review.body}</p>
          )}
        </div>

        {review.image_urls.length > 0 && (
          <div className="px-5 pb-4 flex gap-2">
            {review.image_urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setExpandedImage(url)}
                className="w-16 h-16 border border-zinc-800 overflow-hidden hover:border-zinc-500 transition-colors relative group"
              >
                <img
                  src={url}
                  alt={`Review image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ImageIcon
                    size={12}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {expandedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={expandedImage}
            alt="Expanded review image"
            className="max-w-full max-h-[85vh] object-contain"
          />
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-6 right-6 text-[10px] font-ibm-mono text-zinc-500 hover:text-white tracking-widest transition-colors"
          >
            [ESC]
          </button>
        </div>
      )}
    </>
  );
}
