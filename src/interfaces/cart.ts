import type { ProductType } from "./product";

export interface CartItem extends ProductType {
  selectedSize: number | string;
  cart_quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
}

export interface CartState {
  items: CartItem[];
  addToCart: (product: ProductType, size: number | string, cartQuantity?: number) => void;
  removeFromCart: (productId: string, size: number | string) => void;
  clearCart: () => void;
  increaseQuantity: (productId: string, size: number | string) => void;
  decreaseQuantity: (productId: string, size: number | string) => void;
  totalPrice: () => number;
}
