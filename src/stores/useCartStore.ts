import type { CartState } from "@/interfaces";
import { computeTotal } from "@/utils/computeTotal";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, size) =>
        set((state) => {
          const isItemExist = state.items.find(
            (item) => item.id === product.id && item.selectedSize === size,
          );

          if (isItemExist) {
            return { items: state.items };
          }

          return {
            items: [...state.items, { ...product, selectedSize: size }],
          };
        }),

      removeFromCart: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === productId && item.selectedSize === size),
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => computeTotal(get().items),
    }),
    {
      name: "metallurg-cart-storage",
    },
  ),
);
