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
  // TODO add quantity field to the product type, but it should be managed in the cart store, not in the product type itself.
}
