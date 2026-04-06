export interface ProductType {
  createdAt: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  sizes: number[] | string[];
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  is_new: boolean;
  slug: string;
  quantity: number;
  image_url: string[];
  materials?: string;
  weight?: number;
  model_3d_url?: string;
  condition?: string;
  box?: string;
}

export interface ProductImageSliderProps {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
}
