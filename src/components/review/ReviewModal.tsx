import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ReviewModalProps } from "@/interfaces/review";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Field report modal (design files: Review-D, Review-M, Review-D-Done).
// Desktop: one panel (items + rating left, text + photos right).
// Phones: two steps (1 items + rating → 2 text + photos). One report per order.

type Step = "rating" | "body" | "done" | "error";

const MAX_IMAGES = 3;
const MAX_MB = 8;
const MAX_BODY = 1000;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const RATING_WORDS = ["", "POOR", "WEAK", "OK", "SOLID", "PERFECT"];
const blocks = (n: number) => "█".repeat(n) + "░".repeat(5 - n);

const scanlines = {
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
};

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  const cls = "eyebrow text-[10px] text-gray-400";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {children}
    </label>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmitted,
  orderNumber,
  customerName,
  orderId,
  orderItems,
}: ReviewModalProps) {
  const {
    isChecking,
    isAlreadyReviewed,
    isSubmitting,
    submit,
    reset: resetHook,
  } = useReviewSubmission({ isOpen, orderId });

  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageNote, setImageNote] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setStep("rating");
    setRating(0);
    setBody("");
    setImages([]);
    setPreviews([]);
    setImageNote(null);
    resetHook();
    onClose();
  }, [previews, resetHook, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isSubmitting && handleClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, isSubmitting, handleClose]);

  const addFiles = (files: File[]) => {
    const ok = files.filter((f) => TYPES.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    const toAdd = ok.slice(0, MAX_IMAGES - images.length);
    setImageNote(
      ok.length < files.length
        ? `Only JPG / PNG / WEBP up to ${MAX_MB}MB.`
        : files.length > toAdd.length
          ? `Max ${MAX_IMAGES} photos.`
          : null
    );
    if (toAdd.length === 0) return;
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, j) => j !== i));
    setPreviews((prev) => prev.filter((_, j) => j !== i));
    setImageNote(null);
  };

  const handleSubmit = async () => {
    if (rating === 0 || isSubmitting) return;
    const result = await submit(
      { order_id: orderId, author_name: customerName, rating, body: body.trim() },
      images
    ).catch(() => null);
    if (result) {
      setStep("done");
      onSubmitted();
    } else {
      setStep("error");
    }
  };

  const viewReports = () => {
    handleClose();
    requestAnimationFrame(() =>
      document.getElementById("field-reports")?.scrollIntoView({ behavior: "smooth" })
    );
  };

  // ─── Pieces ─────────────────────────────────────────────────────────────

  const items = (
    <div className="flex flex-col gap-3">
      <Label>01 // ITEMS_IN_THIS_ORDER</Label>
      <ul className="flex flex-col gap-2">
        {orderItems.map((item, i) => (
          <li key={i} className="flex flex-col gap-1 border border-[#374151] px-3 py-2.5">
            <span className="display text-[14px] leading-tight">{item.name}</span>
            <span className="text-[10px] tracking-[0.1em] text-gray-400">
              SIZE {item.selectedSize}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const ratingPicker = (
    <div className="flex flex-col gap-3">
      <Label>02 // RATING</Label>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} of 5`}
            onClick={() => setRating(n)}
            disabled={isSubmitting}
            className={cn(
              "h-14 text-[14px] transition-colors duration-150",
              n <= rating ? "bg-paper text-ink" : "border border-[#374151] hover:border-gray-400"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-[14px] tracking-[0.1em]">
        <span>{blocks(rating)}</span>
        <span className="text-[11px] text-gray-400">
          {rating > 0 ? `${rating} / 5 — ${RATING_WORDS[rating]}` : "TAP TO RATE"}
        </span>
      </div>
    </div>
  );

  const bodyField = (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <Label htmlFor="rv-body">03 // REPORT_BODY</Label>
        <span className="text-[10px] tabular-nums text-gray-400">
          {String(body.length).padStart(3, "0")} / {MAX_BODY}
        </span>
      </div>
      <textarea
        id="rv-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_BODY}
        disabled={isSubmitting}
        placeholder="Fit, condition on arrival, box, delivery time…"
        className="h-48 resize-none border border-gray-400 bg-transparent p-4 text-[16px] leading-relaxed text-paper outline-none transition-colors placeholder:text-gray-600 focus:border-paper disabled:opacity-50 lg:h-[248px] lg:text-[15px]"
      />
    </div>
  );

  const photos = (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <Label>04 // ATTACH_IMAGES</Label>
        <span className="text-[10px] text-gray-400">
          {images.length} / {MAX_IMAGES}
          <span className="hidden lg:inline"> · DRAG &amp; DROP</span>
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:gap-2.5">
        {previews.map((src, i) => (
          <div key={src} className="relative aspect-square bg-paper lg:aspect-auto lg:h-[120px]">
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              disabled={isSubmitting}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center bg-ink text-[12px] text-paper"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            disabled={isSubmitting}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 border border-dashed text-[10px] tracking-[0.1em] text-gray-400 transition-colors lg:aspect-auto lg:h-[120px]",
              dragOver ? "border-paper text-paper" : "border-gray-500 hover:border-gray-300"
            )}
          >
            <span className="text-[20px] text-paper">+</span>
            <span className="hidden lg:inline">DROP OR BROWSE</span>
            <span className="lg:hidden">ADD</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={TYPES.join(",")}
        multiple
        onChange={onPick}
        className="hidden"
      />
      <p className={cn("text-[10px]", imageNote ? "text-status-wait" : "text-gray-500")}>
        {imageNote ?? `JPG / PNG / WEBP · MAX ${MAX_MB}MB EACH · OPTIONAL`}
      </p>
    </div>
  );

  const submitButton = (className?: string) => (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={rating === 0 || isSubmitting}
      className={cn(
        "flex h-14 items-center justify-center bg-paper px-8 text-[12px] font-bold tracking-[0.15em] text-ink transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-[#374151] disabled:text-gray-400",
        className
      )}
    >
      {isSubmitting ? (
        <>
          SENDING<span className="animate-blink-cursor">█</span>
        </>
      ) : (
        "SUBMIT_REPORT →"
      )}
    </button>
  );

  const header = (
    <div className="flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-[#1F2937] px-4 lg:grid lg:h-[60px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-6">
      <span className="eyebrow text-[10px]">
        // FIELD_REPORT
        {(step === "rating" || step === "body") && !isAlreadyReviewed && (
          <span className="lg:hidden"> / {step === "rating" ? "1" : "2"} OF 2</span>
        )}
      </span>
      <span className="hidden text-[10px] tracking-[0.15em] text-gray-400 lg:block">
        ORDER {orderNumber} / <span className="leading-[inherit] text-status-ok">DELIVERED</span>
      </span>
      <button
        type="button"
        onClick={handleClose}
        disabled={isSubmitting}
        className="h-11 justify-self-end text-[11px] tracking-[0.15em] text-gray-400 hover:text-paper"
      >
        [ESC]
      </button>
    </div>
  );

  // ─── States ─────────────────────────────────────────────────────────────

  let content: React.ReactNode;

  if (isChecking) {
    content = (
      <div className="flex flex-col gap-2 p-6" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="h-14 animate-pulse border border-[#1F2937] bg-[#111827]" />
        ))}
      </div>
    );
  } else if (isAlreadyReviewed) {
    content = (
      <div className="flex flex-col items-start gap-4 p-6 lg:p-10">
        <span className="eyebrow text-[10px] text-gray-400">// ALREADY_REPORTED</span>
        <p className="display text-[32px] lg:text-[48px]">Report already filed.</p>
        <p className="text-[13px] leading-relaxed text-gray-300">
          This order already has a field report. Thanks for sharing it.
        </p>
        <button
          type="button"
          onClick={viewReports}
          className="mt-2 h-12 border border-paper px-5 text-[11px] tracking-[0.15em]"
        >
          VIEW_REPORTS →
        </button>
      </div>
    );
  } else if (step === "done") {
    content = (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6 px-4 py-10 lg:gap-7 lg:border-r lg:border-[#1F2937] lg:px-10 lg:py-12">
          <div className="text-[11px] leading-[2.2] text-gray-400 lg:text-[12px]">
            <div>
              <TypingAnimation duration={25} className="leading-[inherit]">
                {"// SENDING_REPORT... "}
              </TypingAnimation>
              <TypingAnimation delay={700} className="leading-[inherit] text-status-ok">
                OK
              </TypingAnimation>
            </div>
            {images.length > 0 && (
              <div>
                <TypingAnimation delay={900} duration={25} className="leading-[inherit]">
                  {`// UPLOADING_IMAGES ${images.length}/${images.length}... `}
                </TypingAnimation>
                <TypingAnimation delay={1700} className="leading-[inherit] text-status-ok">
                  OK
                </TypingAnimation>
              </div>
            )}
            <div>
              <TypingAnimation
                delay={images.length > 0 ? 1900 : 1000}
                duration={25}
                className="leading-[inherit]"
              >
                // FILED TO FIELD_REPORTS
              </TypingAnimation>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE_MTL }}
            className="display text-[44px] leading-[0.9] lg:text-[88px]"
          >
            Thank you, operator.
          </motion.p>
          <p className="max-w-[520px] text-[13px] leading-[1.7] text-gray-300 lg:text-[14px]">
            Your field report is live in Field reports. It helps the next person pick the right
            size.
          </p>
          <div className="flex flex-col gap-2 lg:mt-2 lg:flex-row lg:gap-2.5">
            <button
              type="button"
              onClick={viewReports}
              className="flex h-14 items-center justify-center bg-paper px-7 text-[12px] font-bold tracking-[0.15em] text-ink hover:bg-gray-200"
            >
              VIEW_REPORT →
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="h-12 px-4 text-[11px] tracking-[0.15em] text-gray-400 hover:text-paper lg:h-14"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* filed report preview (desktop) */}
        <div className="hidden flex-col gap-3.5 px-6 py-8 lg:flex">
          <span className="eyebrow text-[10px] text-gray-400">// FILED_REPORT</span>
          <div className="flex flex-col gap-3 border border-[#374151] p-4">
            <div className="flex justify-between text-[13px] tracking-[0.08em]">
              <span>{blocks(rating)}</span>
              <span className="text-[10px] text-gray-400">JUST NOW</span>
            </div>
            <span className="display text-[15px] leading-tight">
              {orderItems.map((i) => i.name).join(" / ")}
            </span>
            {body.trim() && (
              <p className="line-clamp-4 text-[12px] leading-relaxed text-gray-300">
                {body.trim()}
              </p>
            )}
            {previews.length > 0 && (
              <div className="flex gap-1.5">
                {previews.map((src) => (
                  <img key={src} src={src} alt="" className="h-16 w-16 object-cover" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else if (step === "error") {
    content = (
      <div className="flex flex-col items-start gap-4 p-6 lg:p-10">
        <span className="text-[10px] font-bold tracking-[0.15em] text-red-400">
          // REPORT_NOT_SENT
        </span>
        <p className="text-[13px] leading-relaxed text-gray-300">
          Something went wrong. Your rating, text and photos are kept — try again.
        </p>
        <button
          type="button"
          onClick={() => setStep("rating")}
          className="h-12 border border-paper px-5 text-[11px] tracking-[0.15em]"
        >
          TRY_AGAIN →
        </button>
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-5 text-[10px] tracking-[0.15em] text-gray-400 lg:hidden">
            ORDER {orderNumber} /{" "}
            <span className="leading-[inherit] text-status-ok">DELIVERED</span>
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div
              className={cn(
                "flex flex-col gap-6 px-4 py-5 lg:flex lg:border-r lg:border-[#1F2937] lg:p-6",
                step === "body" && "hidden"
              )}
            >
              {items}
              {ratingPicker}
            </div>
            <div
              className={cn(
                "flex flex-col gap-6 px-4 py-5 lg:flex lg:p-6",
                step === "rating" && "hidden"
              )}
            >
              <div className="flex justify-between text-[11px] lg:hidden">
                <span className="truncate pr-3">{orderItems.map((i) => i.name).join(" / ")}</span>
                <span className="flex-shrink-0">{blocks(rating)}</span>
              </div>
              {bodyField}
              {photos}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-shrink-0 gap-2 border-t border-[#1F2937] p-4 lg:items-center lg:justify-between lg:px-6">
          <span className="hidden text-[10px] tracking-[0.15em] text-gray-500 lg:block">
            PUBLISHED IN FIELD REPORTS ON /ORDERS
          </span>
          {/* phones */}
          {step === "rating" ? (
            <button
              type="button"
              onClick={() => setStep("body")}
              disabled={rating === 0}
              className="flex h-14 flex-1 items-center justify-center bg-paper text-[12px] font-bold tracking-[0.15em] text-ink disabled:bg-[#374151] disabled:text-gray-400 lg:hidden"
            >
              {rating === 0 ? "RATE TO CONTINUE" : "NEXT →"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep("rating")}
                disabled={isSubmitting}
                className="h-14 border border-paper px-4 text-[11px] tracking-[0.12em] lg:hidden"
              >
                ← BACK
              </button>
              {submitButton("flex-1 lg:hidden")}
            </>
          )}
          {/* desktop */}
          <div className="hidden gap-2.5 lg:flex">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-14 border border-[#374151] px-5 text-[11px] tracking-[0.12em] text-gray-400 hover:text-paper"
            >
              CANCEL
            </button>
            {submitButton()}
          </div>
        </div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] font-mono"
          role="dialog"
          aria-modal="true"
          aria-label={`Field report for order ${orderNumber}`}
        >
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.page }}
            onClick={() => !isSubmitting && handleClose()}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: DURATION.modal, ease: EASE_MTL }}
            style={scanlines}
            className="absolute inset-0 flex flex-col bg-ink text-paper lg:inset-auto lg:left-1/2 lg:top-[88px] lg:max-h-[calc(100vh-120px)] lg:w-[980px] lg:max-w-[calc(100vw-48px)] lg:-translate-x-1/2 lg:border lg:border-[#374151]"
          >
            {header}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{content}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
