import type { ProductType } from "@/interfaces/product";

export interface ToastConfig {
  product?: ProductType;
  selectedSize?: string | number;
  message?: string;
}
