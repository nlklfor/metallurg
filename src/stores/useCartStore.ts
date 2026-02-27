import type { CartState } from "@/interfaces";
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
            return {
              items: state.items.map((item) =>
                item.id === product.id && item.selectedSize === size
                  ? { ...item }
                  : item,
              ),
            };
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

      totalPrice: () =>
        get().items.reduce((total, item) => total + item.price, 0),
    }),
    {
      name: "metallurg-cart-storage",
    },
  ),
);
