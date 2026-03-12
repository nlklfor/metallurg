import type { CartItem } from "@/interfaces";
import { useCartStore } from "@/stores/useCartStore";
import { Trash2 } from "lucide-react";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const isOutOfStock = item.stock_status === "out_of_stock";

  return (
    <div
      className={`group flex gap-6 p-5 border border-gray-200 transition-all duration-300 ${
        isOutOfStock ? "opacity-30 grayscale blur-[1px]" : "hover:border-gray-400"
      }`}
    >
      {/* IMAGE */}
      <div className="w-28 h-36 bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 relative">
        <img
          src={item.image_url[0]}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <p className="text-gray-500 font-black text-[8px] uppercase tracking-[0.2em]">
              OUT_OF_STOCK
            </p>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="flex flex-col justify-between flex-grow py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-black tracking-tight uppercase">{item.name}</h3>
            <p className="text-[10px] text-gray-400 mt-1 tracking-[0.2em]">
              // SIZE: <span className="text-gray-600">{item.selectedSize}</span>
            </p>
          </div>
          <p className="text-lg font-black text-black italic">
            {item.price.toLocaleString()}{" "}
            <span className="text-xs font-normal text-gray-400">UAH</span>
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          {isOutOfStock && (
            <p className="text-red-400 font-bold text-[9px] uppercase tracking-[0.3em]">
              UNAVAILABLE
            </p>
          )}

          <button
            onClick={() => removeFromCart(item.id, item.selectedSize)}
            className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] ml-auto group/btn"
          >
            <Trash2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
