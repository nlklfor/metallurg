import { useMemo, useState } from "react";
import type { ReviewWithOrderItems } from "@/interfaces/review";
import { cn } from "@/lib/utils";
import ReviewCard from "./ReviewCard";

// Field reports section (design file: Orders-D left stats column + 2-col
// cards; Orders-M stats row, filter chips, stacked cards, LOAD_MORE).

interface ReviewListProps {
  reviews: ReviewWithOrderItems[];
  stats: { average: number; count: number };
  isLoading: boolean;
}

const PAGE = 6;
const pad2 = (n: number) => String(n).padStart(2, "0");
const blocks = (avg: number) => {
  const n = Math.round(avg);
  return "█".repeat(n) + "░".repeat(5 - n);
};

type Filter = "all" | "photos";

function Heading() {
  return (
    <>
      <h2 className="display text-[34px] sm:text-[44px] lg:text-[56px]">Field reports</h2>
      <div className="h-px bg-ink lg:hidden" />
    </>
  );
}

function Stats({
  stats,
  distribution,
}: {
  stats: ReviewListProps["stats"];
  distribution: { label: number; count: number }[];
}) {
  const avg = stats.count > 0 ? stats.average.toFixed(1) : "—";
  return (
    <>
      {/* phones: two cells */}
      <div className="grid grid-cols-2 border border-ink lg:hidden">
        <div className="flex flex-col gap-1.5 border-r border-ink p-3.5">
          <span className="eyebrow text-[10px] text-dim">AVG_RATING</span>
          <span className="text-[26px] font-bold leading-none">{avg}</span>
          <span className="text-[12px] tracking-[0.1em]">{blocks(stats.average)}</span>
        </div>
        <div className="flex flex-col gap-1.5 p-3.5">
          <span className="eyebrow text-[10px] text-dim">REPORTS</span>
          <span className="text-[26px] font-bold leading-none">{pad2(stats.count)}</span>
          <span className="text-[10px] text-dim">VERIFIED ORDERS ONLY</span>
        </div>
      </div>

      {/* desktop: stacked box + distribution */}
      <div className="hidden flex-col gap-2.5 border border-ink p-5 lg:flex">
        <span className="eyebrow text-[10px] text-dim">AVG_RATING</span>
        <span className="text-[44px] font-bold leading-none">{avg}</span>
        <span className="text-[16px] tracking-[0.1em]">{blocks(stats.average)}</span>
        <span className="text-[10px] tracking-[0.1em] text-dim">
          {pad2(stats.count)} {stats.count === 1 ? "REPORT" : "REPORTS"} / VERIFIED ORDERS ONLY
        </span>
      </div>
      <div className="hidden flex-col gap-1.5 text-[11px] lg:flex" aria-label="Rating distribution">
        {distribution.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span className="w-[18px]">{d.label}</span>
            <span className="h-1.5 flex-1 bg-rule">
              <span
                className="block h-1.5 bg-ink transition-[width] duration-500 ease-mtl"
                style={{ width: `${stats.count ? (d.count / stats.count) * 100 : 0}%` }}
              />
            </span>
            <span className="w-6 text-right text-dim tabular-nums">{d.count}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Skeleton() {
  const bar = "bg-[#F3F4F6] animate-[pulse_1.2s_ease-in-out_infinite]";
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5"
      aria-busy="true"
      aria-label="Loading field reports"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3 border border-rule p-3.5 lg:p-5">
          <div className="flex justify-between">
            <div className={`h-3.5 w-20 ${bar}`} />
            <div className={`h-2.5 w-12 ${bar}`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className={`h-4 w-3/4 ${bar}`} />
            <div className={`h-2.5 w-1/2 ${bar}`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-2 w-[88%] ${bar}`} />
            <div className={`h-2 w-[54%] ${bar}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReviewList({ reviews, stats, isLoading }: ReviewListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(PAGE);

  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        label: star,
        count: reviews.filter((r) => r.rating === star).length,
      })),
    [reviews]
  );
  const withPhotos = reviews.filter((r) => (r.image_urls ?? []).length > 0).length;
  const list = filter === "photos" ? reviews.filter((r) => r.image_urls?.length) : reviews;
  const visible = list.slice(0, shown);

  const chip = (value: Filter, label: string, disabled = false) => (
    <button
      type="button"
      aria-pressed={filter === value}
      disabled={disabled}
      onClick={() => {
        setFilter(value);
        setShown(PAGE);
      }}
      className={cn(
        "h-9 border px-3 text-[10px] tracking-[0.12em] transition-colors duration-150",
        filter === value ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink",
        disabled && "cursor-not-allowed text-dim-dark hover:border-rule"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-3 lg:gap-4">
        <Heading />
        {isLoading ? (
          <div className="h-[92px] border border-ink lg:h-[150px]" aria-hidden="true" />
        ) : (
          <Stats stats={stats} distribution={distribution} />
        )}
      </div>

      <div className="flex flex-col gap-3 lg:gap-5">
        {!isLoading && reviews.length > 0 && (
          <div className="flex gap-1.5">
            {chip("all", `ALL ${pad2(reviews.length)}`)}
            {chip("photos", `WITH_PHOTOS ${pad2(withPhotos)}`, withPhotos === 0)}
          </div>
        )}

        {isLoading ? (
          <Skeleton />
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-dashed border-dim-dark px-5 py-12 text-center">
            <p aria-hidden="true" className="text-[12px] tracking-[0.15em] text-dim-dark">
              ░░░░░░░░
            </p>
            <p className="eyebrow text-[11px]">// NO_FIELD_REPORTS_YET</p>
            <p className="text-[12px] text-dim">
              Reports appear here once delivered orders file them.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            {list.length > shown && (
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="h-12 border border-ink text-[11px] tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
              >
                LOAD_MORE ↓ ({pad2(list.length - shown)})
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
