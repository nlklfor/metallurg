import { motion } from "motion/react";
import ReviewCard from "./ReviewCard";
import type { Review, ReviewWithOrderItems } from "@/interfaces/review";

interface ReviewListProps {
  reviews: (Review | ReviewWithOrderItems)[];
  stats: { average: number; count: number };
  isLoading: boolean;
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-ibm-mono text-zinc-600 w-4 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-900 overflow-hidden">
        <div className="h-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-ibm-mono text-zinc-500 w-6">{count}</span>
    </div>
  );
}

export default function ReviewList({ reviews, stats, isLoading }: ReviewListProps) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    label: String(star),
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (isLoading) {
    // Same frame as the loaded list: rating summary, then report cards.
    const bar = "bg-zinc-900 animate-[pulse_1.2s_ease-in-out_infinite]";
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading field reports">
        <div className="border border-zinc-800 p-5">
          <div className="grid grid-cols-[auto_1fr] gap-8">
            <div className="flex flex-col items-center gap-2 border-r border-zinc-800 pr-6">
              <div className={`h-9 w-14 ${bar}`} />
              <div className={`h-2.5 w-16 ${bar}`} />
              <div className={`h-2.5 w-20 ${bar}`} />
            </div>
            <div className="flex flex-col justify-center space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="w-4 text-right text-[10px] text-zinc-700">{n}</span>
                  <div className="h-1.5 flex-1 bg-zinc-900" />
                  <span className="w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-zinc-800 bg-zinc-950/50">
              <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 ${bar}`} />
                  <div className="flex flex-col gap-1.5">
                    <div className={`h-3 w-20 ${bar}`} />
                    <div className={`h-2.5 w-28 ${bar}`} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`h-3 w-16 ${bar}`} />
                  <div className={`h-2.5 w-12 ${bar}`} />
                </div>
              </div>
              <div className="flex flex-col gap-2 px-5 py-4">
                <div className={`h-3 w-[90%] ${bar}`} />
                <div className={`h-3 w-[60%] ${bar}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border border-zinc-800 py-16 text-center">
        <p className="text-[10px] font-ibm-mono text-zinc-500 tracking-[0.15em] uppercase">
          // NO_FIELD_REPORTS
        </p>
        <p className="text-sm font-ibm-mono text-zinc-600 mt-2">Be the first to submit a report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-zinc-800 p-5"
      >
        <div className="grid grid-cols-[auto_1fr] gap-8">
          <div className="text-center pr-6 border-r border-zinc-800">
            <p className="text-4xl font-archivo-black text-white">{stats.average.toFixed(1)}</p>
            <p className="text-[10px] font-ibm-mono text-zinc-600 tracking-[0.15em] mt-1">
              {"█".repeat(Math.round(stats.average))}
              {"░".repeat(5 - Math.round(stats.average))}
            </p>
            <p className="text-[10px] font-ibm-mono text-zinc-500 tracking-[0.15em] mt-1.5">
              {stats.count} REPORT{stats.count !== 1 ? "S" : ""}
            </p>
          </div>
          <div className="space-y-1.5 flex flex-col justify-center">
            {distribution.map((d) => (
              <RatingBar key={d.label} label={d.label} count={d.count} total={stats.count} />
            ))}
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
