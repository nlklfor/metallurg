import type { OrderItem } from "./order";

export interface TrackedOrder {
  order_number: string;
  customer_name: string;
  shipping_zone: string;
  total_price: number;
  status: string;
  current_status_index: number;
  is_international: boolean;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}
