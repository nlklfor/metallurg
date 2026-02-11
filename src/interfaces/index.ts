export interface NavbarProps {
  variant?: "light" | "dark";
}

export interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_3d_url?: string;
}
