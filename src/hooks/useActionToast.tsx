import type { ToastConfig } from "@/interfaces";
import toast from "react-hot-toast";

export type ToastType = "success" | "error" | "warning";

export function useActionToast() {
  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: {
        accent: "bg-white",
        accentBorder: "border-white/20",
        icon: "✓",
        iconColor: "text-white",
        label: "// status: added",
      },
      error: {
        accent: "bg-red-500",
        accentBorder: "border-red-500/20",
        icon: "✕",
        iconColor: "text-red-400",
        label: "// error",
      },
      warning: {
        accent: "bg-yellow-500",
        accentBorder: "border-yellow-500/20",
        icon: "!",
        iconColor: "text-yellow-400",
        label: "// warning",
      },
    };
    return styles[type];
  };

  const showToast = (type: ToastType, config: ToastConfig, duration: number = 3000) => {
    const styles = getToastStyles(type);
    const { product, selectedSize, message } = config;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-toast-in" : "animate-toast-out"
          } max-w-[360px] w-full pointer-events-auto`}
        >
          <div className={`relative flex overflow-hidden bg-black border ${styles.accentBorder}`}>
            {/* Left accent bar */}
            <div className={`w-[3px] flex-shrink-0 ${styles.accent}`} />

            <div className="flex items-center gap-3.5 px-4 py-3.5 flex-1 min-w-0">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-medium">
                  {styles.label}
                </p>

                {product && (
                  <p
                    className="text-[13px] text-white uppercase tracking-wide truncate mt-1"
                    style={{ fontFamily: "'Archivo Black', sans-serif" }}
                  >
                    {product.name}
                  </p>
                )}

                {selectedSize && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-0.5">
                    // size: {selectedSize}
                  </p>
                )}

                {message && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white mt-0.5">
                    {message}
                  </p>
                )}
              </div>

              {/* Product image */}
              {product && (
                <img
                  src={product.image_url[0]}
                  className="w-12 h-12 object-cover flex-shrink-0"
                  alt={product.name}
                />
              )}

              {/* Status icon */}
              <div
                className={`w-7 h-7 flex-shrink-0 border border-white/10 flex items-center justify-center`}
              >
                <span className={`text-xs font-bold ${styles.iconColor}`}>{styles.icon}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration, position: "top-right" }
    );
  };

  return {
    showToast,
    showSuccess: (config: ToastConfig) => showToast("success", config),
    showError: (config: ToastConfig) => showToast("error", config, 4000),
    showWarning: (config: ToastConfig) => showToast("warning", config),
  };
}
