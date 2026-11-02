export interface ProductType {
  /** Legacy camelCase field; rows from Supabase carry `created_at`. */
  createdAt?: string;
  created_at?: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  sizes: number[] | string[];
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  is_new: boolean;
  slug: string;
  quantity: number;
  size_stock?: Record<string, number>;
  image_url: string[];
  materials?: string;
  weight?: number;
  condition?: string;
  box?: string;
  sku?: string;
  category?: "apparel" | "footwear" | "accessories" | null;
}

export interface ProductImageSliderProps {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
}
