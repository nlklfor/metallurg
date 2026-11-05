import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TrackOrderModal from "@/components/tracking/TrackModal";
import ReviewModal from "@/components/review/ReviewModal";
import ReviewList from "@/components/review/ReviewList";
import { useAllReviews } from "@/hooks/useAllReviews";
import { TRACK_URL } from "@/lib/constants/order";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { normalizeOrderCode, toOrderNumber } from "@/utils/trackUtils";
import Seo from "@/components/seo/Seo";

// Orders & field reports (design file: Orders-D / Orders-M).

interface ResolvedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  items: { name: string; selectedSize: string | number; price: number }[];
}

type ReportError = "not_found" | "not_delivered" | "rate_limited" | "network";

const REPORT_ERRORS: Record<ReportError, { title: string; text: string }> = {
  not_found: {
    title: "// ORDER_NOT_FOUND",
    text: "No order with this ID. Check the 6 characters after MTL-.",
  },
  not_delivered: {
    title: "// NOT_DELIVERED_YET",
    text: "Reports unlock once the order is in your hands. Track it to see where it is.",
  },
  rate_limited: {
    title: "// TOO_MANY_ATTEMPTS",
    text: "Too many lookups in a row. Try again in 10 minutes.",
  },
  network: {
    title: "// NO_CONNECTION",
    text: "Couldn't reach the server. Check your connection and try again.",
  },
};

/** MTL- prefix + code input, shared by both cards. */
function CodeField({
  id,
  value,
  onChange,
  invalid,
  className,
  children,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-[52px] border border-ink text-[16px] focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-ink lg:h-[60px] lg:text-[20px]",
        className
      )}
    >
      <label htmlFor={id} className="flex items-center pl-3 text-dim lg:pl-4">
        MTL-
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(normalizeOrderCode(e.target.value))}
        onPaste={(e) => {
          e.preventDefault();
          onChange(normalizeOrderCode(e.clipboardData.getData("text")));
        }}
        placeholder="XXXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-invalid={invalid}
        className="h-full min-w-0 flex-1 bg-transparent pr-3 font-semibold uppercase tracking-[0.06em] outline-none placeholder:font-normal placeholder:text-dim-dark"
      />
      {children}
    </div>
  );
}

export default function Orders() {
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackCode, setTrackCode] = useState("");
  const [reportCode, setReportCode] = useState("");
  const [reviewOrder, setReviewOrder] = useState<ResolvedOrder | null>(null);
  const [reportError, setReportError] = useState<ReportError | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { reviews, stats, isLoading: reviewsLoading, refetch } = useAllReviews();

  const openTrack = () => setTrackOpen(true);

  const lookupForReport = async () => {
    if (reportCode.length < 4 || isLookingUp) return;
    setIsLookingUp(true);
    setReportError(null);
    try {
      const res = await fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: toOrderNumber(reportCode) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) return setReportError("rate_limited");
      if (!res.ok || data.error) return setReportError("not_found");
      if (data.status !== "completed") return setReportError("not_delivered");

      setReviewOrder({
        id: data.id,
        order_number: data.order_number,
        customer_name: data.customer_name,
        items: data.items,
      });
      setReportCode("");
    } catch {
      setReportError("network");
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-mono text-ink">
      <Seo />
      <Navbar variant="light" />
      <TrackOrderModal
        isOpen={trackOpen}
        initialCode={trackCode}
        onClose={() => {
          setTrackOpen(false);
          setTrackCode("");
        }}
      />
      {reviewOrder && (
        <ReviewModal
          isOpen
          onClose={() => setReviewOrder(null)}
          onSubmitted={() => refetch()}
          orderNumber={reviewOrder.order_number}
          customerName={reviewOrder.customer_name}
          orderId={reviewOrder.id}
          orderItems={reviewOrder.items}
        />
      )}

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
      </div>

      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">Orders</h1>
        <div className="h-px bg-ink" />
        <p className="text-[12px] leading-relaxed lg:text-[13px]">
          Track an acquisition. File a field report once it's in your hands.
        </p>
      </header>

      {/* ─── Actions ─── */}
      <section
        className="grid grid-cols-1 gap-3 px-4 sm:px-8 md:grid-cols-2 md:px-12 lg:gap-6"
        aria-label="Order actions"
      >
        {/* 01 — track */}
        <div className="flex flex-col gap-3 border border-ink p-4 lg:gap-4 lg:p-6">
          <span className="eyebrow text-[10px]">01 // TRACK_BY_CODE</span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              openTrack();
            }}
          >
            <CodeField id="orders-track" value={trackCode} onChange={setTrackCode}>
              <button
                type="submit"
                aria-label="Locate order"
                className="flex w-14 items-center justify-center bg-ink text-[12px] font-bold tracking-[0.15em] text-paper transition-colors hover:bg-[#222] lg:w-auto lg:px-7"
              >
                <span className="hidden lg:inline">LOCATE →</span>
                <span className="lg:hidden" aria-hidden="true">
                  →
                </span>
              </button>
            </CodeField>
          </form>
          <p className="text-[11px] leading-relaxed text-dim">
            The 6-character code from your confirmation screen, receipt or Telegram message.
          </p>
        </div>

        {/* 02 — field report */}
        <div className="flex flex-col gap-3 border border-rule p-4 lg:gap-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-[10px]">02 // WRITE_FIELD_REPORT</span>
            <span className="border border-status-ok px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-[#15803D]">
              DELIVERED ONLY
            </span>
          </div>
          <form
            className="flex flex-col gap-2 lg:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void lookupForReport();
            }}
          >
            <CodeField
              id="orders-report"
              value={reportCode}
              onChange={(v) => {
                setReportCode(v);
                setReportError(null);
              }}
              invalid={!!reportError}
              className="border-rule focus-within:border-ink lg:flex-1"
            >
              {null}
            </CodeField>
            <button
              type="submit"
              disabled={reportCode.length < 4 || isLookingUp}
              className="flex h-12 items-center justify-center border border-ink px-6 text-[11px] tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink lg:h-[60px] lg:text-[12px]"
            >
              {isLookingUp ? (
                <>
                  CHECKING<span className="animate-blink-cursor">█</span>
                </>
              ) : (
                "FILE_REPORT →"
              )}
            </button>
          </form>
          <AnimatePresence initial={false} mode="wait">
            {reportError ? (
              <motion.div
                key={reportError}
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.chip, ease: EASE_MTL }}
                className="flex flex-col gap-1.5 border border-status-error p-3"
              >
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#B91C1C]">
                  {REPORT_ERRORS[reportError].title}
                </span>
                <span className="text-[12px]">{REPORT_ERRORS[reportError].text}</span>
                {reportError === "not_delivered" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTrackCode(reportCode);
                      openTrack();
                    }}
                    className="h-9 self-start text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
                  >
                    TRACK_THIS_ORDER →
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] leading-relaxed text-dim"
              >
                Enter a delivered order ID to unlock the report form.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Field reports ─── */}
      <section
        className="px-4 pb-16 pt-12 sm:px-8 md:px-12 lg:pb-24 lg:pt-[72px]"
        aria-label="Field reports"
      >
        <ReviewList reviews={reviews} stats={stats} isLoading={reviewsLoading} />
      </section>

      <Footer />
    </div>
  );
}
