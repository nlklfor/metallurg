import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: "apparel" | "footwear" | "accessories" | null;
}

const APPAREL_STEPS = [
  {
    label: "CHEST",
    instruction:
      "Wrap the tape around the widest part of your chest, just under your armpits. Keep it horizontal.",
  },
  {
    label: "WAIST",
    instruction:
      "Measure around the narrowest part of your waist, usually just above the belly button.",
  },
  {
    label: "HIPS",
    instruction: "Measure around the fullest part of your hips, about 20 cm below your waist.",
  },
  {
    label: "LENGTH",
    instruction:
      "Measure from the top of your shoulder straight down to where you want the garment to end.",
  },
];

const FOOTWEAR_STEPS = [
  {
    label: "STEP_01",
    instruction:
      "Place a sheet of paper on the floor against a wall. Stand on it with your heel touching the wall.",
  },
  {
    label: "STEP_02",
    instruction:
      "Mark the tip of your longest toe on the paper. Measure the distance from the wall to the mark in cm.",
  },
  {
    label: "STEP_03",
    instruction:
      "Measure both feet — use the larger measurement. Feet are often slightly different sizes.",
  },
  {
    label: "BEST_TIME",
    instruction:
      "Measure in the evening. Feet expand slightly throughout the day and are largest by night.",
  },
];

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const isFootwear = category === "footwear";
  const steps = isFootwear ? FOOTWEAR_STEPS : APPAREL_STEPS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="w-full max-w-md bg-[#0a0a0a] text-white border border-zinc-800 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 flex-shrink-0">
                <div>
                  <p className="text-[9px] font-ibm-mono uppercase tracking-[0.4em] text-zinc-600">
                    // HOW_TO_MEASURE
                  </p>
                  <p className="text-[11px] font-archivo-black uppercase tracking-[0.2em] text-zinc-200 mt-0.5">
                    {isFootwear ? "FOOTWEAR" : "APPAREL"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[10px] font-ibm-mono text-zinc-600 hover:text-white transition-colors tracking-widest"
                >
                  [ESC]
                </button>
              </div>

              {/* steps */}
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 border border-zinc-700 flex items-center justify-center mt-0.5">
                      <span className="text-[9px] font-ibm-mono text-zinc-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-zinc-500 mb-1">
                        // {step.label}
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* footer */}
              <div className="border-t border-zinc-900 px-6 py-4 flex-shrink-0">
                <p className="text-[9px] font-ibm-mono text-zinc-600 leading-relaxed uppercase tracking-[0.15em]">
                  {isFootwear
                    ? "// IF BETWEEN SIZES — SIZE UP FOR COMFORT."
                    : "// SIZES VARY BY BRAND. IF BETWEEN SIZES — SIZE UP."}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
