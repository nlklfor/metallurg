import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrackOrder } from "@/hooks/useTrackOrder";
import { INTERNATIONAL_ROUTE, LOCAL_ROUTE } from "@/lib/constants/index";
import TrackStep from "@/components/TrackStep";
import type { TrackOrderModalProps, TrackStepDefinition } from "@/interfaces";

export default function TrackOrderModal({
  isOpen,
  onClose,
}: TrackOrderModalProps) {
  const [input, setInput] = useState("");
  const { order, isLoading, error, trackOrder, reset } = useTrackOrder();

  const route: TrackStepDefinition[] | null = order
    ? order.is_international
      ? INTERNATIONAL_ROUTE
      : LOCAL_ROUTE
    : null;

  const handleClose = () => {
    reset();
    setInput("");
    onClose();
  };

  const handleTrack = () => trackOrder(input);

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
                    METALLURG // SYSTEM
                  </p>
                  <p className="text-[11px] font-archivo-black uppercase tracking-[0.25em] text-zinc-200 mt-0.5">
                    MTL_TRACKING_SYSTEM
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-[10px] font-ibm-mono text-zinc-700 hover:text-white transition-colors tracking-widest"
                >
                  [ESC]
                </button>
              </div>

              <div className="relative z-10 px-6 pt-6 pb-5">
                <p className="text-[8px] font-ibm-mono uppercase tracking-[0.4em] text-zinc-700 mb-2">
                  // INPUT_ORDER_ID
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    placeholder="MTL-1234"
                    className="flex-1 font-ibm-mono bg-zinc-950 border border-zinc-700 border-r-0 px-4 py-3 text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-zinc-400 uppercase tracking-[0.3em] transition-colors"
                  />
                  <button
                    onClick={handleTrack}
                    disabled={isLoading || !input.trim()}
                    className="bg-white text-black px-5 font-archivo-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        ...
                      </motion.span>
                    ) : (
                      "GO →"
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-ibm-mono text-red-500 mt-3 tracking-[0.2em] uppercase"
                    >
                      ✗ {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {order && route && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10 border-t border-zinc-800"
                  >
                    <div className="px-6 py-4 border-b border-zinc-900 grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
                          ORDER_ID
                        </p>
                        <p className="text-sm font-archivo-black tracking-widest text-white mt-0.5">
                          {order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
                          ROUTE_TYPE
                        </p>
                        <p className="text-[10px] font-ibm-mono text-zinc-400 tracking-wider mt-0.5">
                          {order.is_international
                            ? "🌍 INTERNATIONAL"
                            : "🇺🇦 LOCAL"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
                          CUSTOMER
                        </p>
                        <p className="text-[10px] font-ibm-mono text-zinc-400 tracking-wider mt-0.5 uppercase">
                          {order.customer_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.3em] uppercase">
                          ZONE
                        </p>
                        <p className="text-[10px] font-ibm-mono text-zinc-400 tracking-wider mt-0.5">
                          {order.shipping_zone}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pt-6 pb-2">
                      <p className="text-[8px] font-ibm-mono text-zinc-700 tracking-[0.4em] uppercase mb-6">
                        // DELIVERY_PIPELINE
                      </p>
                      {route.map((step: TrackStepDefinition, i: number) => (
                        <TrackStep
                          key={step.label}
                          step={step}
                          index={i}
                          currentIndex={order.current_status_index}
                          isLast={i === route.length - 1}
                          trackingNumber={order.tracking_number}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 border-t border-zinc-900 px-6 py-3 flex justify-between">
                <span className="text-[8px] font-ibm-mono text-zinc-800 tracking-widest">
                  ENCRYPTED_CHANNEL
                </span>
                <span className="text-[8px] font-ibm-mono text-zinc-800 tracking-widest">
                  MTL_V2.0_2026
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
