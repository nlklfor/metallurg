export interface NavbarProps {
  variant?: "light" | "dark";
}

export interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  is_new: boolean;
  slug: string;
  image_url: string[];
  model_3d_url?: string;
}
