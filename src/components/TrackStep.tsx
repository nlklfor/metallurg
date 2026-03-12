import { motion } from "framer-motion";
import type { TrackStepProps } from "@/interfaces";

export default function TrackStep({
  step,
  index,
  currentIndex,
  isLast,
  trackingNumber,
}: TrackStepProps) {
  const Icon = step.icon;
  const isCompleted = index < currentIndex;
  const isActive = index === currentIndex;
  const isFuture = index > currentIndex;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          animate={
            isActive
              ? {
                  filter: [
                    "drop-shadow(0 0 3px rgba(255,255,255,0.3))",
                    "drop-shadow(0 0 10px rgba(255,255,255,0.9))",
                    "drop-shadow(0 0 3px rgba(255,255,255,0.3))",
                  ],
                }
              : {}
          }
          transition={isActive ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
          className={`w-8 h-8 flex items-center justify-center border transition-all duration-500 ${
            isActive
              ? "border-white bg-black"
              : isCompleted
                ? "border-zinc-700 bg-zinc-900"
                : "border-zinc-900 bg-black"
          }`}
        >
          <Icon
            size={14}
            className={isActive ? "text-white" : isCompleted ? "text-zinc-600" : "text-zinc-900"}
          />
        </motion.div>

        {!isLast && (
          <div
            className={`w-px mt-1 min-h-[36px] flex-1 transition-all duration-700 ${
              isCompleted ? "bg-zinc-700" : "bg-zinc-900"
            }`}
          />
        )}
      </div>

      <div className="pb-8 pt-1">
        <motion.p
          animate={
            isActive
              ? {
                  textShadow: [
                    "0 0 4px rgba(255,255,255,0.2)",
                    "0 0 14px rgba(255,255,255,0.8)",
                    "0 0 4px rgba(255,255,255,0.2)",
                  ],
                }
              : {}
          }
          transition={isActive ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
          className={`text-xs font-bold tracking-[0.2em] uppercase transition-all duration-500 ${
            isActive ? "text-white" : isCompleted ? "text-zinc-700" : "text-zinc-900"
          }`}
          style={isFuture ? { opacity: 0.05 } : {}}
        >
          {step.label}
        </motion.p>

        <p
          className={`text-[10px] tracking-wider mt-0.5 transition-all duration-500 ${
            isActive ? "text-zinc-500" : "text-zinc-800"
          }`}
          style={isFuture ? { opacity: 0.05 } : {}}
        >
          {step.sublabel}
        </p>

        {isLast && isActive && trackingNumber && (
          <motion.a
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            href={`https://novaposhta.ua/tracking/?cargo_number=${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-[9px] tracking-[0.2em] text-white border border-zinc-600 px-3 py-1.5 hover:border-white hover:bg-white hover:text-black transition-all uppercase"
          >
            TRACK_ON_NP → {trackingNumber}
          </motion.a>
        )}
      </div>
    </div>
  );
}
