import type { ToastConfig } from "@/interfaces";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning";

// Toast spec: black panel, 3px accent bar on the left, eyebrow status line,
// 44px close target. Slides in from the right (top-right; full width on
// mobile). Accent colors are status colors only.
const STYLES: Record<ToastType, { bar: string; label: string; labelColor: string }> = {
  success: { bar: "bg-paper", label: "// status: ADDED_TO_LOADOUT", labelColor: "text-dim-dark" },
  error: { bar: "bg-status-error", label: "// status: ERROR", labelColor: "text-status-error" },
  warning: {
    bar: "bg-status-wait",
    label: "// status: WARNING",
    labelColor: "text-status-wait",
  },
};

export function useActionToast() {
  const showToast = (type: ToastType, config: ToastConfig, duration: number = 4000) => {
    const s = STYLES[type];
    const { product, selectedSize, message } = config;

    toast.custom(
      (t) => (
        <div
          role="status"
          className={cn(
            t.visible ? "animate-toast-in" : "animate-toast-out",
            "pointer-events-auto flex w-[calc(100vw-32px)] max-w-[380px] bg-ink font-mono text-paper sm:w-[380px]"
          )}
        >
          <div className={cn("w-[3px] flex-shrink-0", s.bar)} />

          {product?.image_url?.[0] && (
            <img
              src={product.image_url[0]}
              alt=""
              className="m-2.5 h-[72px] w-[72px] flex-shrink-0 bg-paper object-cover"
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-3 text-[11px]">
            <p className={cn("tracking-[0.15em]", s.labelColor)}>{s.label}</p>
            {product && (
              <p className="truncate font-semibold uppercase">
                {product.name}
                {selectedSize ? ` // ${selectedSize}` : ""}
              </p>
            )}
            {message && !product && <p className="uppercase tracking-[0.1em]">{message}</p>}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-sm text-dim-dark transition-colors hover:text-paper"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ),
      { duration, position: "top-right" }
    );
  };

  return {
    showToast,
    showSuccess: (config: ToastConfig) => showToast("success", config),
    showError: (config: ToastConfig) => showToast("error", config),
    showWarning: (config: ToastConfig) => showToast("warning", config),
  };
}
