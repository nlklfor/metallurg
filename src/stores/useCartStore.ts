import type { CartState } from "@/interfaces";
import { computeTotal } from "@/utils/computeTotal";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, size, quantity = 1) =>
        set((state) => {
          const isItemExist = state.items.find(
            (item) => item.id === product.id && item.selectedSize === size
          );

          if (isItemExist) {
            return { items: state.items };
          }

          return {
            items: [...state.items, { ...product, selectedSize: size, cart_quantity: quantity }],
          };
        }),

      removeFromCart: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === productId && item.selectedSize === size)
          ),
        })),

      increaseQuantity: (productId, size) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === productId && item.selectedSize === size) {
              const maxQty = item.quantity ?? 99;
              const newQty = Math.min((item.cart_quantity ?? 1) + 1, maxQty);
              return { ...item, cart_quantity: newQty };
            }
            return item;
          }),
        })),

      decreaseQuantity: (productId, size) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === productId && item.selectedSize === size) {
              const minQty = 1;
              const newQty = Math.max((item.cart_quantity ?? 1) - 1, minQty);
              return { ...item, cart_quantity: newQty };
            }
            return item;
          }),
        })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => computeTotal(get().items),
    }),
    {
      name: "metallurg-cart-storage",
    }
  )
);
