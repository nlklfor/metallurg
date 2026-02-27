////// NAVBAR PROPS ////////

export interface NavbarProps {
  variant?: "light" | "dark";
}

////////// PRODUCT TYPES ////////

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

//////// FILTER OPTIONS ////////

export interface FilterOptions {
  sortBy: "price-asc" | "price-desc" | "newest";
  sizes: string[];
  priceRange: [number, number];
}

//////// CART TYPES ////////

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
