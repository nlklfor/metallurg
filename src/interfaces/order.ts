export type OrderStep = "form" | "submitting" | "success" | "error";
export type ShippingZone = "Ukraine" | "International";

export interface Order {
  order_number: string;
  customer_name: string;
  contact: string;
  total_price: number;
  delivery_cost: number;
  status: string;
  current_status_index: number;
  is_international: boolean;
  tracking_number: string | null;
  shipping_zone: ShippingZone;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  selectedSize: string | number;
  price: number;
}

export interface NPCity {
  ref: string;
  name: string;
  area: string;
}

export interface NPWarehouse {
  ref: string;
  description: string;
}

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TrackStepDefinition {
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

export interface TrackStepProps {
  step: TrackStepDefinition;
  index: number;
  currentIndex: number;
  isLast: boolean;
  trackingNumber: string | null;
}
