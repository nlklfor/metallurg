import type { ProductType } from "@/interfaces";
import toast from "react-hot-toast";

export function useAddToCartToast() {
  const showAddedToast = (product: ProductType, selectedSize: number) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-4 bg-white text-black px-6 py-4 border border-gray-200 shadow-xl`}
        >
          <img
            src={product.image_url[0]}
            className="w-12 h-12 object-cover"
            alt={product.name}
          />
          <div>
            <p className="font-black uppercase tracking-widest text-xs text-gray-500">
              // item_added
            </p>
            <p className="font-bold uppercase">{product.name}</p>
            <p className="text-sm text-gray-500">Size: {selectedSize}</p>
          </div>
          <span className="text-2xl ml-2">→</span>
        </div>
      ),
      { duration: 3000 },
    );
  };

  return { showAddedToast };
}
