import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTrackOrder, type TrackError } from "@/hooks/useTrackOrder";
import { INTERNATIONAL_ROUTE, LOCAL_ROUTE, STATUS_LABELS } from "@/lib/constants/index";
import { telegramOrderLink } from "@/lib/constants/navigation";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import Pipeline from "@/components/tracking/TrackStep";
import NpTrackingPanel from "@/components/tracking/NpTrackingPanel";
import type { Order, TrackOrderModalProps } from "@/interfaces";
import {
  formatStamp,
  normalizeOrderCode,
  npUrl,
  readRecentOrders,
  type RecentOrder,
} from "@/utils/trackUtils";

// Track modal (design file: Track-D / Track-M).

const ERRORS: Record<TrackError, { title: string; text: string }> = {
  not_found: {
    title: "// ORDER_NOT_FOUND",
    text: "No order with this ID. Check the 6 characters after MTL-.",
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

const BADGE: Record<string, string> = {
  waiting_for_payment: "border-status-wait text-yellow-400",
  paid: "border-status-info text-blue-400",
  processing: "border-status-info text-blue-400",
  shipped: "border-status-ok text-green-400",
  completed: "border-status-ok text-green-400",
  cancelled: "border-status-error text-red-400",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "border px-2 py-1 text-[10px] tracking-[0.15em]",
        BADGE[status] ?? "border-zinc-700 text-white"
      )}
    >
      {STATUS_LABELS[status] ?? status.toUpperCase()}
    </span>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const currency = useCurrencyStore((s) => s.currency);
  const items = (order.items ?? []) as (Order["items"][number] & { cart_quantity?: number })[];
  const units = items.reduce((n, i) => n + (i.cart_quantity ?? 1), 0);
  const placed = formatStamp(order.created_at);
  return (
    <div className="flex flex-col gap-2 border border-zinc-800 p-3.5 text-[11px] lg:grid lg:grid-cols-3 lg:gap-6 lg:p-5 lg:text-[12px]">
      {placed && (
        <div className="flex justify-between lg:flex-col lg:gap-1">
          <span className="text-zinc-500">PLACED</span>
          <span>{placed}</span>
        </div>
      )}
      <div className="flex justify-between lg:flex-col lg:gap-1">
        <span className="text-zinc-500">LINES</span>
        <span>
          {pad2(items.length)} · {pad2(units)} {units === 1 ? "UNIT" : "UNITS"}
        </span>
      </div>
      <div className="flex justify-between lg:flex-col lg:gap-1">
        <span className="text-zinc-500">TOTAL</span>
        <span className="tabular-nums">{formatPrice(order.total_price, currency)}</span>
      </div>
    </div>
  );
}

export default function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [code, setCode] = useState("");
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { order, isLoading, error, trackOrder, reset } = useTrackOrder();

  const handleClose = useCallback(() => {
    reset();
    setCode("");
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      setRecent(readRecentOrders());
      inputRef.current?.focus();
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, handleClose]);

  const canLocate = code.length >= 4 && !isLoading;
  const locate = (value = code) => {
    if (normalizeOrderCode(value).length < 4 || isLoading) return;
    setCode(normalizeOrderCode(value));
    void trackOrder(value);
  };
  const searchAgain = () => {
    reset();
    setRecent(readRecentOrders());
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ─── Derived order state ──────────────────────────────────────────────────

  const isUkraine = order?.shipping_zone === "Ukraine";
  const route = order ? (isUkraine ? LOCAL_ROUTE : INTERNATIONAL_ROUTE) : [];
  const cancelled = order?.status === "cancelled";
  const delivered = order?.status === "completed";
  const current = Math.min(Math.max(order?.current_status_index ?? 0, 0), route.length - 1);
  // Ukraine orders pick up from a Nova Poshta branch: show NP as soon as the
  // order is shipped, not only when the route reaches its last step.
  const ttn = order?.tracking_number ?? null;
  const showNp =
    !!ttn &&
    !cancelled &&
    (order?.status === "shipped" || delivered || current === route.length - 1);

  // ─── Pieces ───────────────────────────────────────────────────────────────

  const lookup = (
    <div className="flex flex-col gap-3">
      <label htmlFor="track-code" className="eyebrow text-[10px] text-zinc-500">
        // ORDER_ID
      </label>
      <form
        className="flex flex-col gap-3 lg:flex-row lg:items-stretch"
        onSubmit={(e) => {
          e.preventDefault();
          locate();
        }}
      >
        <div className="flex h-16 flex-1 items-center border border-zinc-700 text-[22px] font-semibold tracking-[0.06em] focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-white lg:h-[60px]">
          <span aria-hidden="true" className="pl-4 text-zinc-500">
            MTL-
          </span>
          <input
            ref={inputRef}
            id="track-code"
            value={code}
            onChange={(e) => setCode(normalizeOrderCode(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              setCode(normalizeOrderCode(e.clipboardData.getData("text")));
            }}
            placeholder="7K2QPX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby="track-help"
            aria-invalid={error === "not_found"}
            className="h-full min-w-0 flex-1 bg-transparent pr-4 uppercase outline-none placeholder:font-normal placeholder:text-zinc-700"
          />
        </div>
        <button
          type="submit"
          disabled={!canLocate}
          className="flex h-14 items-center justify-center bg-white px-8 text-[13px] font-bold tracking-[0.15em] text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 lg:h-[60px]"
        >
          {isLoading ? (
            <>
              LOCATING<span className="animate-blink-cursor">█</span>
            </>
          ) : (
            "LOCATE →"
          )}
        </button>
      </form>
      {!order && (
        <p id="track-help" className="text-[11px] leading-relaxed text-zinc-500">
          The 6-character code from your confirmation screen, receipt or Telegram message.
        </p>
      )}

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key={error}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.chip, ease: EASE_MTL }}
            className="flex flex-col gap-1.5 border border-status-error p-3.5"
          >
            <span className="text-[10px] font-bold tracking-[0.15em] text-red-400">
              {ERRORS[error].title}
            </span>
            <span className="text-[12px]">{ERRORS[error].text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!order && recent.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <span className="eyebrow text-[10px] text-zinc-500">// RECENT_ON_THIS_DEVICE</span>
          {recent.map((r) => (
            <button
              key={r.orderNumber}
              type="button"
              onClick={() => locate(r.orderNumber)}
              className="flex h-12 items-center justify-between border border-zinc-800 px-3.5 text-[12px] transition-colors hover:border-zinc-400"
            >
              <span>{r.orderNumber}</span>
              <span className="text-[10px] text-zinc-500">
                {formatStamp(r.at)?.split(" · ")[0]} →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const result = order && (
    <motion.section
      key={order.order_number}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.page, ease: EASE_MTL }}
      className="flex flex-col gap-6"
      aria-label={`Order ${order.order_number}`}
    >
      <button
        type="button"
        onClick={searchAgain}
        className="-mb-2 h-9 self-start text-[11px] tracking-[0.15em] text-zinc-500 hover:text-white lg:hidden"
      >
        ← TRACK_ANOTHER
      </button>

      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-[10px] text-zinc-500">
          // DELIVERY_PIPELINE — <span className="lg:hidden">{isUkraine ? "UA" : "INTL"}</span>
          <span className="hidden lg:inline">{isUkraine ? "UKRAINE" : "INTERNATIONAL"}</span>
        </span>
        <StatusBadge status={order.status} />
      </div>

      {cancelled ? (
        <div className="flex flex-col gap-1.5 border border-status-error p-4">
          <span className="text-[10px] font-bold tracking-[0.15em] text-red-400">
            // ORDER_CANCELLED
          </span>
          <span className="text-[12px]">
            This order was cancelled, so there's no delivery to follow. Questions? Ask us in
            Telegram.
          </span>
        </div>
      ) : (
        <>
          <Pipeline
            steps={route}
            currentIndex={current}
            firstStamp={formatStamp(order.created_at)}
          />
        </>
      )}

      {showNp && ttn ? (
        <NpTrackingPanel ttn={ttn} customerName={order.customer_name} />
      ) : (
        <OrderSummary order={order} />
      )}
    </motion.section>
  );

  const footer = order && (
    <div
      className={cn(
        "relative flex flex-shrink-0 flex-col gap-2 border-t border-zinc-700 bg-black px-4 pb-5 pt-4 lg:flex-row lg:items-center lg:justify-between lg:px-7 lg:py-4",
        // desktop has the NP button inside the panel, so nothing would be left here
        showNp && ttn && (delivered || cancelled) && "lg:hidden"
      )}
    >
      {showNp && ttn ? (
        <a
          href={npUrl(ttn)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[52px] items-center justify-center border border-zinc-700 text-[11px] tracking-[0.15em] lg:hidden"
        >
          OPEN IN NOVA POSHTA →
        </a>
      ) : (
        <a
          href={telegramOrderLink(order.order_number)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[52px] items-center justify-center bg-white px-6 text-[11px] font-bold tracking-[0.15em] !text-black transition-colors hover:bg-zinc-200 lg:order-2 lg:h-12"
        >
          ASK IN TELEGRAM →
        </a>
      )}
      {!delivered && !cancelled && (
        <span className="flex h-9 items-center justify-center text-[10px] tracking-[0.15em] text-zinc-500 lg:order-1 lg:h-auto lg:justify-start">
          FIELD_REPORT UNLOCKS ON HANDOVER
        </span>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] font-mono text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Track order"
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.page }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: DURATION.modal, ease: EASE_MTL }}
            className="absolute inset-0 flex flex-col border-zinc-800 bg-black lg:inset-auto lg:left-1/2 lg:top-16 lg:max-h-[calc(100vh-96px)] lg:w-[1080px] lg:max-w-[calc(100vw-48px)] lg:-translate-x-1/2 lg:border"
          >
            {/* faint scanlines, as on the original tracking screen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
              }}
            />
            <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-700 px-4 lg:h-16 lg:px-7">
              <span className="eyebrow">
                {order ? `// ${order.order_number}` : "// TRACK_ORDER"}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="h-11 text-[11px] tracking-[0.15em] hover:text-zinc-400"
              >
                [ESC]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div
                className={cn(
                  "px-4 py-8 lg:p-7",
                  order && "hidden lg:block lg:border-b lg:border-zinc-800"
                )}
              >
                {lookup}
              </div>
              {result && <div className="px-4 py-5 lg:p-7">{result}</div>}
            </div>

            {footer}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
