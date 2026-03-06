import type { ToastConfig } from "@/interfaces";
import toast from "react-hot-toast";

export type ToastType = "success" | "error" | "warning";

export function useActionToast() {
  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: {
        bg: "bg-white",
        text: "text-black",
        border: "border-white",
        icon: "✓",
        label: "// success",
      },
      error: {
        bg: "bg-red-950",
        text: "text-white",
        border: "border-red-800",
        icon: "!",
        label: "// error",
      },
      warning: {
        bg: "bg-yellow-900",
        text: "text-white",
        border: "border-yellow-700",
        icon: "⚠",
        label: "// warning",
      },
    };
    return styles[type];
  };

  const showToast = (
    type: ToastType,
    config: ToastConfig,
    duration: number = 3000,
  ) => {
    const styles = getToastStyles(type);
    const { product, selectedSize, message } = config;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-4 ${styles.bg} ${styles.text} px-6 py-4 border ${styles.border} shadow-xl rounded`}
        >
          {product && (
            <img
              src={product.image_url[0]}
              className="w-12 h-12 object-cover rounded"
              alt={product.name}
            />
          )}

          <div className="flex-1">
            <p
              className={`font-black uppercase tracking-widest text-xs opacity-70`}
            >
              {styles.label}
            </p>

            {product && (
              <>
                <p className="font-bold uppercase text-sm">{product.name}</p>
                {selectedSize && (
                  <p className={`text-xs opacity-75`}>Size: {selectedSize}</p>
                )}
              </>
            )}

            {message && <p className="font-semibold text-sm">{message}</p>}
          </div>

          <span className="text-2xl font-black">{styles.icon}</span>
        </div>
      ),
      { duration },
    );
  };

  return {
    showToast,
    showSuccess: (config: ToastConfig) => showToast("success", config),
    showError: (config: ToastConfig) => showToast("error", config, 4000),
    showWarning: (config: ToastConfig) => showToast("warning", config),
  };
}
