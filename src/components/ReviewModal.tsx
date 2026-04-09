import type { ChangeEvent } from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Star } from "lucide-react";
import type { ReviewModalProps } from "@/interfaces/review";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";

type ModalStep = "form" | "submitting" | "success" | "error";

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
    error,
    submit,
    reset: resetHook,
  } = useReviewSubmission({ isOpen, orderId });

  const [step, setStep] = useState<ModalStep>("form");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRating = hoverRating || rating;

  const reset = () => {
    setStep("form");
    setRating(0);
    setHoverRating(0);
    setBody("");
    setImages([]);
    setPreviews([]);
    resetHook();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = files.filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
    const remaining = 3 - images.length;
    const toAdd = allowed.slice(0, remaining);

    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setStep("submitting");

    const result = await submit(
      {
        order_id: orderId,
        author_name: customerName,
        rating,
        body: body.trim(),
      },
      images
    ).catch(() => null);

    if (result) {
      setStep("success");
      onSubmitted();
    } else {
      setStep("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 z-40 backdrop-blur-md"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-black text-white border border-zinc-800 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
                }}
              />

              <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <div>
                  <p className="text-[8px] font-ibm-mono uppercase tracking-[0.5em] text-zinc-700">
                    METALLURG // REPORTS
                  </p>
                  <p className="text-[11px] font-archivo-black uppercase tracking-[0.25em] text-zinc-200 mt-0.5">
                    FIELD_REPORT — {orderNumber}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-[10px] font-ibm-mono text-zinc-700 hover:text-white transition-colors tracking-widest"
                >
                  [ESC]
                </button>
              </div>

              {isChecking && (
                <div className="relative z-10 px-6 py-12">
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 bg-zinc-900/50 animate-pulse border border-zinc-800"
                      />
                    ))}
                  </div>
                </div>
              )}

              {!isChecking && isAlreadyReviewed && (
                <div className="relative z-10 px-6 py-12 text-center space-y-5">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center">
                    <span className="text-2xl text-zinc-500">✓</span>
                  </div>
                  <div>
                    <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase">
                      // ALREADY_REPORTED
                    </p>
                    <p className="text-sm font-archivo-black uppercase tracking-wider mt-1">
                      Order already reviewed
                    </p>
                    <p className="text-[10px] font-ibm-mono text-zinc-600 mt-2">
                      A field report for this order has already been submitted.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-[10px] font-ibm-mono text-zinc-600 hover:text-white transition-colors tracking-[0.3em] uppercase"
                  >
                    [ DISMISS ]
                  </button>
                </div>
              )}

              {!isChecking &&
                !isAlreadyReviewed &&
                (step === "form" || step === "submitting" || isSubmitting) && (
                  <div className="relative z-10 px-6 py-6 space-y-6">
                    {/* Order items list */}
                    <div className="pb-4 border-b border-zinc-900">
                      <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase mb-3">
                        // ORDER_ITEMS
                      </p>
                      <div className="space-y-1.5">
                        {orderItems.map((item, i) => (
                          <p
                            key={i}
                            className="text-[10px] font-ibm-mono text-zinc-400 tracking-wider"
                          >
                            → {item.name}
                            <span className="text-zinc-700 ml-2">SIZE: {item.selectedSize}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase mb-3">
                        // RATING *
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            disabled={isSubmitting}
                            className="p-1 transition-all disabled:opacity-50"
                          >
                            <Star
                              size={20}
                              className={`transition-colors ${
                                star <= activeRating
                                  ? "fill-white text-white"
                                  : "fill-transparent text-zinc-700"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-[10px] font-ibm-mono text-zinc-600 tracking-wider">
                          {activeRating > 0
                            ? `${"█".repeat(activeRating)}${"░".repeat(5 - activeRating)}`
                            : "░░░░░"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase mb-2">
                        // REPORT_BODY
                      </p>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="How does the object perform in the field?"
                        maxLength={1000}
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm font-ibm-mono text-white placeholder-zinc-800 focus:outline-none focus:border-zinc-500 transition-colors resize-none disabled:opacity-50"
                      />
                      <p className="text-[8px] font-ibm-mono text-zinc-800 text-right mt-1">
                        {body.length}/1000
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase mb-2">
                        // ATTACH_IMAGES ({images.length}/3)
                      </p>
                      <div className="flex gap-2">
                        {previews.map((src, i) => (
                          <div key={i} className="relative w-16 h-16 border border-zinc-800 group">
                            <img
                              src={src}
                              alt={`Upload ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(i)}
                              disabled={isSubmitting}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} className="text-white" />
                            </button>
                          </div>
                        ))}
                        {images.length < 3 && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="w-16 h-16 border border-dashed border-zinc-800 flex items-center justify-center hover:border-zinc-500 transition-colors disabled:opacity-50"
                          >
                            <Upload size={14} className="text-zinc-700" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageAdd}
                        className="hidden"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={rating === 0 || isSubmitting}
                      className="w-full bg-white text-black py-4 font-archivo-black text-[11px] uppercase tracking-[0.4em] hover:bg-zinc-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="font-ibm-mono"
                        >
                          TRANSMITTING...
                        </motion.span>
                      ) : (
                        "SUBMIT_REPORT →"
                      )}
                    </button>
                  </div>
                )}

              {step === "success" && (
                <div className="relative z-10 px-6 py-12 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 bg-white mx-auto flex items-center justify-center"
                  >
                    <span className="text-2xl font-archivo-black text-black">✓</span>
                  </motion.div>
                  <div>
                    <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase">
                      // REPORT_LOGGED
                    </p>
                    <p className="text-lg font-archivo-black uppercase tracking-wider mt-1">
                      Thank you, operator.
                    </p>
                    <p className="text-[10px] font-ibm-mono text-zinc-600 mt-2">
                      Your field report has been recorded.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-[10px] font-ibm-mono text-zinc-600 hover:text-white transition-colors tracking-[0.3em] uppercase"
                  >
                    [ DISMISS ]
                  </button>
                </div>
              )}

              {step === "error" && (
                <div className="relative z-10 px-6 py-12 text-center space-y-5">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center">
                    <span className="text-2xl text-red-500">✗</span>
                  </div>
                  <div>
                    <p className="text-[8px] font-ibm-mono text-red-500 tracking-[0.4em] uppercase">
                      // TRANSMISSION_FAILED
                    </p>
                    <p className="text-[10px] font-ibm-mono text-zinc-500 mt-2 max-w-xs mx-auto">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("form")}
                    className="text-[10px] font-ibm-mono text-zinc-600 hover:text-white transition-colors tracking-[0.3em] uppercase"
                  >
                    [ RETRY ]
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
