import { motion, AnimatePresence } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { SHIPPING_ZONES } from "@/lib/constants/index";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import type { CheckoutModalProps, NPCity, NPWarehouse } from "@/interfaces";
import AsyncCombobox from "@/components/checkout/AsyncCombobox";
import { searchCities, searchWarehouses } from "@/api/novaPoshta";
import { telegramOrderLink } from "@/lib/constants/navigation";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ReceiptDownloadLink = lazy(() => import("@/components/checkout/ReceiptDownloadLink"));

const pad2 = (n: number) => String(n).padStart(2, "0");
const label = "eyebrow text-[9px] tracking-[0.25em] text-dim";
const inputClass =
  "h-12 w-full border border-rule bg-paper px-3.5 text-[14px] tracking-[0.04em] placeholder:text-[#9CA3AF] focus:border-ink focus:outline-none disabled:opacity-50 max-sm:h-[52px]";

function Field({
  id,
  text,
  children,
  hint,
  error,
}: {
  id?: string;
  text: string;
  children: React.ReactNode;
  hint?: string;
  error?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn(label, error && "text-status-error")}>
        {text}
      </label>
      {children}
      {error ? (
        <p className="text-[10px] tracking-[0.1em] text-status-error">// ERROR_DETECTED: {error}</p>
      ) : hint ? (
        <p className="text-[10px] tracking-[0.1em] text-dim">{hint}</p>
      ) : null}
    </div>
  );
}

// Checkout (design file: Checkout-D / Checkout-M).
// Desktop: 1000px panel, form left, summary + CONFIRM right.
// Mobile: full-screen sheet, collapsible summary on top, totals + CONFIRM pinned.
// States: form · submitting (fields lock, log types) · error (input kept,
// retry in place) · success (order id, Telegram updates, receipt).
export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const c = useCheckout();
  const currency = useCurrencyStore((s) => s.currency);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const close = () => c.handleClose(onClose);
  const { handleClose, step } = c;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "submitting") handleClose(onClose);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, handleClose, onClose, step]);

  const busy = step === "submitting";
  const units = c.items.reduce((n, i) => n + (i.cart_quantity ?? 1), 0);

  const deliveryText = c.isUkraine
    ? c.isCalculatingDelivery
      ? "CALCULATING…"
      : c.deliveryCost !== null
        ? formatPrice(c.deliveryCost, currency)
        : "SELECT_CITY"
    : "TBC";
  const deliveryKnown = !c.isUkraine || c.deliveryCost !== null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(c.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the id stays visible and selectable */
    }
  };

  // ─── Pieces ───────────────────────────────────────────────────────────────

  const lines = (
    <div className="flex flex-col gap-3">
      {c.items.map((item) => (
        <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col gap-0.5">
          <div className="flex justify-between gap-3 text-[12px]">
            <span className="min-w-0 truncate uppercase">
              {item.name}
              {item.selectedSize !== "ONE_SIZE" && ` // ${item.selectedSize}`}
            </span>
            <span className="flex-shrink-0 font-semibold tabular-nums">
              {formatPrice(item.price * item.cart_quantity, currency)}
            </span>
          </div>
          <span className="text-[10px] text-dim">
            {formatPrice(item.price, currency)} × {item.cart_quantity} ·{" "}
            {item.stock_status === "pre_order" ? "PRE_ORDER" : "IN_STOCK"}
          </span>
        </div>
      ))}
    </div>
  );

  const totals = (
    <div className="flex flex-col gap-2.5 text-[12px]">
      <div className="flex justify-between">
        <span className="text-dim">SUBTOTAL</span>
        <span className="tabular-nums">{formatPrice(c.itemsTotal, currency)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-dim">
          DELIVERY {c.isUkraine ? "(NOVA POSHTA)" : "(INTERNATIONAL)"}
        </span>
        <span className={cn("tabular-nums", !deliveryKnown && "text-dim")}>{deliveryText}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-ink pt-3">
        <span className="text-[11px] tracking-[0.2em]">TOTAL</span>
        <span className="text-[22px] font-bold tabular-nums lg:text-[24px]">
          {formatPrice(c.total, currency)}
          {!deliveryKnown && <span className="text-[13px] font-normal text-dim"> + NP</span>}
        </span>
      </div>
      {currency !== "UAH" && (
        <p className="text-right text-[10px] tracking-[0.1em] text-dim">CHARGED IN UAH</p>
      )}
    </div>
  );

  const confirm = (
    <button
      type="button"
      onClick={c.handleSubmit}
      disabled={!c.isFormValid || busy}
      className="flex h-14 w-full items-center justify-center bg-ink text-[13px] font-bold tracking-[0.2em] text-paper transition-colors hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-30 lg:h-[60px]"
    >
      {busy ? (
        <span className="animate-pulse">PROCESSING_ORDER…</span>
      ) : step === "error" ? (
        "RETRY →"
      ) : (
        "CONFIRM_ORDER →"
      )}
    </button>
  );

  const form = (
    <div
      className={cn("flex flex-col gap-4 lg:gap-[18px]", busy && "pointer-events-none opacity-35")}
    >
      {step === "error" && (
        <div className="flex flex-col gap-2 border border-status-error p-4" role="alert">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#B91C1C]">
            // TRANSMISSION_FAILED
          </p>
          <p className="text-[12px] leading-relaxed">{c.errorMsg}</p>
          <p className="text-[10px] tracking-[0.1em] text-dim">
            Your loadout and details are intact. Check them and retry.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field id="co-name" text="// FULL_NAME">
          <input
            id="co-name"
            type="text"
            autoComplete="name"
            value={c.name}
            onChange={(e) => c.setName(e.target.value)}
            placeholder="Full name"
            disabled={busy}
            className={inputClass}
          />
        </Field>
        <Field id="co-contact" text="// TELEGRAM_USERNAME_OR_PHONE">
          <input
            id="co-contact"
            type="text"
            value={c.contact}
            onChange={(e) => c.setContact(e.target.value)}
            placeholder="@username or +380…"
            disabled={busy}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="co-email" text="// EMAIL (OPTIONAL)" hint="Receipt copy and order confirmation.">
        <input
          id="co-email"
          type="email"
          autoComplete="email"
          value={c.email}
          onChange={(e) => c.setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={busy}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className={label}>// SHIPPING_ZONE</span>
        <div className="grid h-12 grid-cols-2 border border-ink">
          {SHIPPING_ZONES.map((z, i) => (
            <button
              key={z}
              type="button"
              onClick={() => c.setZone(z)}
              disabled={busy}
              aria-pressed={c.zone === z}
              className={cn(
                "text-[11px] uppercase tracking-[0.15em] transition-colors duration-150",
                i > 0 && "border-l border-ink",
                c.zone === z ? "bg-ink text-paper" : "hover:bg-[#F3F4F6]"
              )}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {c.isUkraine ? (
          <motion.div
            key="ua"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.hover }}
            className="flex flex-col gap-4"
          >
            <Field
              id="co-phone"
              text="// PHONE_FOR_NOVA_POSHTA"
              hint="Nova Poshta sends the pickup SMS to this number."
              error={c.phoneInvalid ? "ENTER A UKRAINIAN MOBILE NUMBER" : null}
            >
              <input
                id="co-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={c.phone}
                onChange={(e) => c.setPhone(e.target.value)}
                placeholder="+380 67 123 45 67"
                disabled={busy}
                aria-invalid={c.phoneInvalid}
                className={cn(
                  inputClass,
                  c.phoneInvalid && "border-status-error focus:border-status-error"
                )}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field text="// CITY">
                <AsyncCombobox<NPCity>
                  value={c.selectedCity}
                  onChange={c.setSelectedCity}
                  fetchOptions={searchCities}
                  getOptionLabel={(city) => `${city.name}${city.area ? ` (${city.area})` : ""}`}
                  getOptionKey={(city) => city.ref}
                  placeholder="START TYPING A CITY…"
                  disabled={busy}
                />
              </Field>
              <Field text="// NOVA_POSHTA_BRANCH">
                <AsyncCombobox<NPWarehouse>
                  value={c.selectedWarehouse}
                  onChange={c.setSelectedWarehouse}
                  fetchOptions={(q) => searchWarehouses(c.selectedCity!.ref, q)}
                  getOptionLabel={(w) => w.description}
                  getOptionKey={(w) => w.ref}
                  placeholder={c.selectedCity ? "SEARCH BRANCH…" : "SELECT A CITY FIRST"}
                  disabled={busy || !c.selectedCity}
                  minQueryLength={0}
                />
              </Field>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="intl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.hover }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field id="co-country" text="// COUNTRY">
                <input
                  id="co-country"
                  type="text"
                  autoComplete="country-name"
                  value={c.country}
                  onChange={(e) => c.setCountry(e.target.value)}
                  placeholder="Switzerland"
                  disabled={busy}
                  className={inputClass}
                />
              </Field>
              <Field id="co-city" text="// CITY">
                <input
                  id="co-city"
                  type="text"
                  autoComplete="address-level2"
                  value={c.intlCity}
                  onChange={(e) => c.setIntlCity(e.target.value)}
                  placeholder="Zürich"
                  disabled={busy}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex gap-3 border border-ink p-3.5 text-[11px] leading-relaxed">
              <span className="font-bold">◎</span>
              <span>
                DELIVERY COST CONFIRMED AFTER CHECKOUT. We send the exact rate in Telegram before
                anything ships.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11px] leading-relaxed text-dim">
        Pre-order units ship in 10–14 days, in-stock units on confirmation. Payment details follow
        in Telegram.
      </p>
    </div>
  );

  const log = busy && (
    <div className="bg-ink p-4 text-[11px] leading-[2] text-paper">
      <p>
        // PACKING_MANIFEST… <span className="text-status-ok">OK</span>
      </p>
      <p>
        // TRANSMITTING_TO_MTL_NETWORK… <span className="text-status-ok">OK</span>
      </p>
      <p className="text-dim-dark">
        // AWAITING_ACK<span className="animate-blink-cursor text-paper">█</span>
      </p>
    </div>
  );

  const success = (
    <div className="mx-auto flex w-full max-w-[560px] flex-col">
      <div className="flex flex-col gap-3.5 border-b border-rule pb-6">
        <p className={label}>// ORDER_ID</p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.modal, ease: EASE_MTL }}
          className="select-all text-[44px] font-bold leading-none tracking-[0.02em] lg:text-[56px]"
        >
          {c.orderNumber}
        </motion.p>
        <p className="bg-ink px-3 py-2.5 text-[11px] tracking-[0.15em] text-paper">
          SAVE THIS ID TO TRACK YOUR ORDER
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyId}
            className="h-11 flex-1 border border-ink text-[11px] tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
          >
            {copied ? "COPIED ✓" : "COPY_ID"}
          </button>
          <a
            href={telegramOrderLink(c.orderNumber)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 flex-1 items-center justify-center border border-ink text-[11px] tracking-[0.15em] transition-colors hover:bg-ink hover:!text-paper"
          >
            SEND TO TELEGRAM
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 py-5 text-[12px]">
        <p className={label}>// CHECKLIST</p>
        <p className="flex gap-2.5">
          <span className="text-[#15803D]">✓</span>ORDER_REGISTERED
        </p>
        <p className="flex gap-2.5">
          <span className="text-[#15803D]">✓</span>OBJECTS RESERVED: {pad2(units)} UNITS
        </p>
        <p className="flex gap-2.5">
          <span className="text-[#A16207]">◎</span>
          <span>STATUS: WAITING_FOR_PAYMENT — we send payment details in Telegram</span>
        </p>
      </div>

      {c.confirmedOrder && (
        <div className="flex flex-col gap-1.5 border border-rule p-3 text-[11px]">
          {c.confirmedOrder.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span className="min-w-0 truncate uppercase">
                {item.name} // {item.selectedSize}{" "}
                <span className="text-dim">×{item.cart_quantity}</span>
              </span>
              <span className="flex-shrink-0 whitespace-nowrap tabular-nums">
                {formatPrice(item.price * item.cart_quantity, currency)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-rule pt-1.5 font-bold">
            <span>TOTAL</span>
            <span className="tabular-nums">
              {formatPrice(c.confirmedOrder.total_price, currency)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <a
          href={telegramOrderLink(c.orderNumber)}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 items-center justify-center bg-ink text-[12px] font-bold tracking-[0.15em] !text-paper transition-colors hover:bg-[#222]"
        >
          GET_STATUS_UPDATES_IN_TELEGRAM →
        </a>
        <div className="flex h-12 items-stretch justify-center border border-ink">
          <Suspense
            fallback={
              <span className="text-[10px] tracking-[0.2em] text-dim">↓ DOWNLOAD_RECEIPT</span>
            }
          >
            {c.confirmedOrder && (
              <ReceiptDownloadLink
                data={{
                  orderNumber: c.confirmedOrder.order_number,
                  customerName: c.confirmedOrder.customer_name,
                  contact: c.confirmedOrder.contact,
                  zone: c.confirmedOrder.shipping_zone,
                  items: c.confirmedOrder.items,
                  deliveryCost: c.confirmedOrder.delivery_cost ?? 0,
                  total: c.confirmedOrder.total_price,
                  date: c.confirmedOrder.created_at,
                  currency,
                }}
              />
            )}
          </Suspense>
        </div>
        <button
          type="button"
          onClick={close}
          className="h-11 text-[10px] tracking-[0.15em] text-dim underline underline-offset-4 hover:text-ink"
        >
          CLOSE_AND_CLEAR_LOADOUT
        </button>
      </div>
    </div>
  );

  // ─── Shell ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] font-mono text-ink"
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
        >
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.page }}
            onClick={() => !busy && close()}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: DURATION.modal, ease: EASE_MTL }}
            className="absolute inset-0 flex flex-col border-ink bg-paper lg:inset-auto lg:left-1/2 lg:top-16 lg:max-h-[calc(100vh-96px)] lg:w-[1000px] lg:-translate-x-1/2 lg:border"
          >
            {/* Header */}
            <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-ink px-4 lg:h-16 lg:px-7">
              <div className="flex items-baseline gap-4">
                <span className="eyebrow">
                  {step === "success" ? "// ORDER_CONFIRMED" : "// CHECKOUT"}
                </span>
                <span className="display hidden text-[26px] lg:inline">
                  {step === "success" ? "Transmitted" : "Acquisition"}
                </span>
              </div>
              {step === "success" ? (
                <button
                  type="button"
                  onClick={close}
                  className="flex h-11 items-center gap-2 text-[11px] tracking-[0.15em]"
                >
                  <span aria-hidden="true" className="h-2 w-2 bg-status-ok" />
                  [ESC]
                </button>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  className="h-11 text-[11px] tracking-[0.15em] hover:text-dim disabled:text-[#D1D5DB]"
                >
                  [ESC]
                </button>
              )}
            </div>

            {step === "success" ? (
              <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-7 lg:py-10">{success}</div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
                {/* Form column */}
                <div className="flex-1 overflow-y-auto px-4 py-4 lg:border-r lg:border-rule lg:p-7">
                  {/* Mobile summary (collapsible) */}
                  <div className="mb-4 border border-rule p-3 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setSummaryOpen((v) => !v)}
                      aria-expanded={summaryOpen}
                      className="flex w-full justify-between"
                    >
                      <span className={label}>// ORDER_SUMMARY</span>
                      <span className="text-[10px] text-dim">
                        {pad2(c.items.length)} LINES {summaryOpen ? "▴" : "▾"}
                      </span>
                    </button>
                    {summaryOpen && <div className="mt-3">{lines}</div>}
                  </div>
                  {form}
                  {log && <div className="mt-4">{log}</div>}
                </div>

                {/* Desktop summary column */}
                <div className="hidden flex-col gap-3.5 overflow-y-auto bg-[#FAFAFA] p-7 lg:flex">
                  <p className={label}>// ORDER_SUMMARY</p>
                  {lines}
                  <div className="h-px bg-rule" />
                  {totals}
                  <div className="mt-2">{confirm}</div>
                  <p className="text-[9px] leading-relaxed tracking-[0.12em] text-dim">
                    BY CONFIRMING YOU ACCEPT THE PROTOCOL + PRIVACY &amp; TERMS.
                  </p>
                </div>

                {/* Mobile pinned footer */}
                <div
                  className="flex flex-shrink-0 flex-col gap-2 border-t border-ink px-4 pt-3.5 lg:hidden"
                  style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
                >
                  {totals}
                  <div className="mt-1.5">{confirm}</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
