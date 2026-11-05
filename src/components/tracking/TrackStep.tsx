import { motion, useReducedMotion } from "motion/react";
import type { TrackStepDefinition } from "@/interfaces";
import { cn } from "@/lib/utils";

// Delivery pipeline on the dark tracking screen. The active step "breathes"
// (soft white glow on its icon and label). Vertical on phones, a row from lg.

type StepState = "done" | "active" | "future";

interface PipelineProps {
  steps: TrackStepDefinition[];
  /** Index of the active step; steps before it are done. */
  currentIndex: number;
  /** Shown after the first step's text (when the order was placed). */
  firstStamp?: string | null;
}

const BREATH = { duration: 2.5, repeat: Infinity, ease: "easeInOut" } as const;

function Marker({ step, state }: { step: TrackStepDefinition; state: StepState }) {
  const Icon = step.icon;
  const reduce = useReducedMotion();
  const breathing = state === "active" && !reduce;
  return (
    <motion.span
      aria-hidden="true"
      animate={
        breathing
          ? {
              filter: [
                "drop-shadow(0 0 3px rgba(255,255,255,0.3))",
                "drop-shadow(0 0 10px rgba(255,255,255,0.9))",
                "drop-shadow(0 0 3px rgba(255,255,255,0.3))",
              ],
            }
          : undefined
      }
      transition={breathing ? BREATH : undefined}
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center border",
        state === "active" && "border-white bg-black",
        state === "done" && "border-zinc-700 bg-zinc-900",
        state === "future" && "border-zinc-800 bg-black"
      )}
    >
      <Icon
        size={14}
        className={cn(
          state === "active" && "text-white",
          state === "done" && "text-zinc-500",
          state === "future" && "text-zinc-700"
        )}
      />
    </motion.span>
  );
}

export default function Pipeline({ steps, currentIndex, firstStamp }: PipelineProps) {
  const reduce = useReducedMotion();
  const stateOf = (i: number): StepState =>
    i < currentIndex ? "done" : i === currentIndex ? "active" : "future";

  return (
    <ol
      className="flex flex-col lg:grid"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, i) => {
        const state = stateOf(i);
        const isLast = i === steps.length - 1;
        const breathing = state === "active" && !reduce;
        return (
          <li
            key={step.label}
            aria-current={state === "active" ? "step" : undefined}
            className="flex gap-4 lg:flex-col lg:gap-3"
          >
            {/* marker + connector: column on phones, row from lg */}
            <div className="flex flex-col items-center lg:flex-row">
              <Marker step={step} state={state} />
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 min-h-[36px] w-px flex-1 lg:ml-1 lg:mt-0 lg:h-px lg:min-h-0 lg:w-auto",
                    i < currentIndex ? "bg-zinc-600" : "bg-zinc-800"
                  )}
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1 pb-7 pt-1.5 lg:pb-0 lg:pr-4 lg:pt-0">
              <motion.span
                animate={
                  breathing
                    ? {
                        textShadow: [
                          "0 0 4px rgba(255,255,255,0.2)",
                          "0 0 14px rgba(255,255,255,0.8)",
                          "0 0 4px rgba(255,255,255,0.2)",
                        ],
                      }
                    : undefined
                }
                transition={breathing ? BREATH : undefined}
                className={cn(
                  "break-words text-[12px] font-bold tracking-[0.15em]",
                  state === "active" && "text-white",
                  state === "done" && "text-zinc-500",
                  state === "future" && "text-zinc-700"
                )}
              >
                {step.label}
              </motion.span>
              <span
                className={cn(
                  "text-[10px] leading-relaxed tracking-[0.05em]",
                  state === "active" ? "text-zinc-400" : "text-zinc-600",
                  state === "future" && "text-zinc-700"
                )}
              >
                {step.sublabel}
                {i === 0 && firstStamp && ` // ${firstStamp}`}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
