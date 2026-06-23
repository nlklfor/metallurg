import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "@/hooks/useCheckout";
import { SHIPPING_ZONES } from "@/lib/constants/index";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import type { CheckoutModalProps } from "@/interfaces";
import { lazy, Suspense, useEffect } from "react";

const ReceiptDownloadLink = lazy(() => import("@/components/checkout/ReceiptDownloadLink"));

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const {
    step,
    setStep,
    orderNumber,
    errorMsg,
    name,
    setName,
    contact,
    setContact,
    zone,
    setZone,
    city,
    setCity,
    npBranch,
    setNpBranch,
    isUkraine,
    isFormValid,
    items,
    total,
    handleSubmit,
    handleClose,
  } = useCheckout();

  const currency = useCurrencyStore((state) => state.currency);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose(onClose);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleClose(onClose)}
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => handleClose(onClose)}
          >
            <div
              className="w-full max-w-lg bg-white text-black border border-black flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* sticky header */}
              <div className="flex items-center justify-between border-b border-black px-6 py-4 flex-shrink-0">
                <span className="text-[10px] font-ibm-mono uppercase tracking-[0.3em] text-gray-500">
                  METALLURG // CHECKOUT
                </span>
                <button
                  onClick={() => handleClose(onClose)}
                  className="text-xs font-ibm-mono text-gray-400 hover:text-black transition-colors tracking-widest"
                >
                  [ESC]
                </button>
              </div>

              {/* scrollable content */}
              <div className="overflow-y-auto flex-1">
                {(step === "form" || step === "submitting") && (
                  <div className="px-6 py-8 space-y-6">
                    <div className="border border-gray-200 p-4 space-y-2">
                      <p className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400 mb-3">
                        // ORDER_SUMMARY
                      </p>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs font-ibm-mono">
                          <span className="text-gray-600 truncate max-w-[60%]">
                            {item.name}{" "}
                            <span className="text-gray-400">SZ_{item.selectedSize}</span>
                          </span>
                          <span>{formatPrice(item.price, currency)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm font-archivo-black">
                        <span>TOTAL</span>
                        <span>{formatPrice(total, currency)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                        // FULL_NAME
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ENTER FULL NAME"
                        disabled={step === "submitting"}
                        className="w-full font-ibm-mono border border-black px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black disabled:opacity-50 uppercase tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                        // TELEGRAM_USERNAME_OR_PHONE
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="@USERNAME OR +380..."
                        disabled={step === "submitting"}
                        className="w-full font-ibm-mono border border-black px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black disabled:opacity-50 tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                        // SHIPPING_ZONE
                      </label>
                      <div className="flex gap-2">
                        {SHIPPING_ZONES.map((z) => (
                          <button
                            key={z}
                            onClick={() => setZone(z)}
                            disabled={step === "submitting"}
                            className={`flex-1 py-3 font-ibm-mono text-[10px] uppercase tracking-[0.2em] border transition-all duration-150 disabled:opacity-50 ${
                              zone === z
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-black hover:bg-gray-100"
                            }`}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isUkraine && (
                        <motion.div
                          key="ukraine-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="space-y-1">
                            <label className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                              // CITY
                            </label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="KYIV / KHARKIV / LVIV..."
                              disabled={step === "submitting"}
                              className="w-full font-ibm-mono border border-black px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black disabled:opacity-50 uppercase tracking-wider"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                              // NOVA_POSHTA_BRANCH
                            </label>
                            <input
                              type="text"
                              value={npBranch}
                              onChange={(e) => setNpBranch(e.target.value)}
                              placeholder="BRANCH № OR ADDRESS"
                              disabled={step === "submitting"}
                              className="w-full font-ibm-mono border border-black px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black disabled:opacity-50 uppercase tracking-wider"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || step === "submitting"}
                      className="w-full bg-black text-white py-4 font-archivo-black text-[11px] uppercase tracking-[0.4em] hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {step === "submitting" ? (
                        <span className="animate-pulse font-ibm-mono">PROCESSING_ORDER...</span>
                      ) : (
                        "CONFIRM_ORDER →"
                      )}
                    </button>
                  </div>
                )}

                {step === "success" && (
                  <div className="px-6 py-10 text-center space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                        // ORDER_CONFIRMED
                      </p>
                      <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="text-4xl font-archivo-black tracking-tight mt-4"
                      >
                        {orderNumber}
                      </motion.p>
                      <p className="text-[10px] font-ibm-mono text-gray-400 tracking-widest mt-2">
                        SAVE THIS ID TO TRACK YOUR ORDER
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 text-left space-y-2 text-xs font-ibm-mono text-gray-500">
                      <p>✓ ORDER RECEIVED BY METALLURG</p>
                      <p>✓ NOTIFICATION SENT TO STORE</p>
                      <p>◎ WE WILL CONTACT YOU SHORTLY</p>
                    </div>

                    <p className="text-[10px] font-ibm-mono text-gray-400 leading-relaxed">
                      USE <span className="text-black font-bold">{orderNumber}</span> IN THE{" "}
                      <span className="text-black">TRACK_MY_ORDER</span> SECTION TO CHECK YOUR
                      DELIVERY STATUS.
                    </p>

                    <Suspense
                      fallback={
                        <span className="text-[10px] font-ibm-mono text-gray-300 tracking-[0.2em] uppercase">
                          ↓ DOWNLOAD_RECEIPT
                        </span>
                      }
                    >
                      <ReceiptDownloadLink
                        data={{
                          orderNumber,
                          customerName: name,
                          contact,
                          zone,
                          items,
                          total,
                          date: new Date().toISOString(),
                          currency,
                        }}
                      />
                    </Suspense>

                    <button
                      onClick={() => handleClose(onClose)}
                      className="w-full border border-black py-4 font-archivo-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all"
                    >
                      CLOSE_AND_CLEAR_LOADOUT
                    </button>
                  </div>
                )}

                {step === "error" && (
                  <div className="px-6 py-10 text-center space-y-6">
                    <p className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400">
                      // ERROR_DETECTED
                    </p>
                    <p className="text-xs text-red-500 border border-red-200 p-4 text-left font-ibm-mono">
                      {errorMsg}
                    </p>
                    <button
                      onClick={() => setStep("form")}
                      className="w-full border border-black py-4 font-archivo-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all"
                    >
                      RETRY →
                    </button>
                  </div>
                )}
              </div>

              {/* sticky footer */}
              <div className="border-t border-gray-100 px-6 py-3 flex justify-between flex-shrink-0">
                <span className="text-[8px] font-ibm-mono text-gray-300 tracking-widest">
                  METALLURG™
                </span>
                <span className="text-[8px] font-ibm-mono text-gray-300 tracking-widest">
                  MTL_BASE_2026
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
