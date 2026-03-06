import type { CartItem } from "@/interfaces";
import { useCartStore } from "@/stores/useCartStore";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const onRemove = useCartStore((state) => state.removeFromCart);

  return (
    <div className="group flex gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="w-32 h-40 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
        <img
          src={item.image_url[0]}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col justify-between flex-grow py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              {item.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              // SIZE:{" "}
              <span className="text-gray-900">{item.selectedSize}</span>
            </p>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">
            {item.price.toLocaleString()} UAH
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          <Button
            onClick={() => onRemove(item.id, item.selectedSize)}
            className="flex items-center gap-2 text-gray-400 bg-transparent hover:text-red-500 hover:bg-red-100 transition-colors text-xs font-bold uppercase tracking-tighter"
          >
            <Trash2 size={16} />
            <span>Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
