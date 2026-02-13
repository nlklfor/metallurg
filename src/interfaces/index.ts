export interface NavbarProps {
  variant?: "light" | "dark";
}

export interface ProductType {
  createdAt: string;
  id: number;
  name: string;
  description?: string;
  price: number;
  sizes: number[];
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  is_new: boolean;
  slug: string;
  image_url: string[];
  model_3d_url?: string;
}

export interface FilterOptions {
  sortBy: 'price-asc' | 'price-desc' | 'newest'
  sizes: string[]
  priceRange: [number, number]
}
