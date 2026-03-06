import type { ProductType } from "./product";

export interface CartItem extends ProductType {
  selectedSize: number | string;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
}

export interface CartState {
  items: CartItem[];
  addToCart: (product: ProductType, size: number | string) => void;
  removeFromCart: (productId: string, size: number | string) => void;
  clearCart: () => void;
  totalPrice: () => number;
}
