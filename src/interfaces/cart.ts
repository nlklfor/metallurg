import type { ProductType } from "@/interfaces/product";

export interface CartItem extends ProductType {
  selectedSize: number;
}

export interface CartState {
  items: CartItem[];
  addToCart: (product: ProductType, size: number) => void;
  removeFromCart: (productId: number, size: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}
