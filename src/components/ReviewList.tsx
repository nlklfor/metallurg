import { motion } from "framer-motion";
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
      <span className="text-[9px] font-ibm-mono text-zinc-600 w-4 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-900 overflow-hidden">
        <div className="h-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-ibm-mono text-zinc-700 w-6">{count}</span>
    </div>
  );
}

export default function ReviewList({ reviews, stats, isLoading }: ReviewListProps) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    label: String(star),
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-zinc-900/50 animate-pulse border border-zinc-800" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border border-zinc-800 py-16 text-center">
        <p className="text-[10px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase">
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
            <p className="text-[9px] font-ibm-mono text-zinc-600 tracking-[0.3em] mt-1">
              {"█".repeat(Math.round(stats.average))}
              {"░".repeat(5 - Math.round(stats.average))}
            </p>
            <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.2em] mt-1.5">
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
