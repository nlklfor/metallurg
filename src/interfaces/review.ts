export interface Review {
  id: string;
  product_id: string | null;
  order_id: string;
  author_name: string;
  rating: number;
  size_purchased: string | null;
  body: string | null;
  image_urls: string[];
  created_at: string;
}

export interface ReviewWithOrderItems extends Review {
  order_items: { name: string; selectedSize: string | number; price: number }[];
}

export interface ReviewFormData {
  order_id: string;
  author_name: string;
  rating: number;
  body: string;
}

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  orderNumber: string;
  customerName: string;
  orderId: string;
  orderItems: { name: string; selectedSize: string | number; price: number }[];
}
