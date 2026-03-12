import { useState } from "react";
import supabase from "@/lib/supabase";
import type { Order } from "@/interfaces";

export function useTrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackOrder = async (orderNumber: string) => {
    const trimmed = orderNumber.trim().toUpperCase();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    const { data, error: sbError } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, shipping_zone, total_price, status, current_status_index, is_international, tracking_number, created_at, items"
      )
      .eq("order_number", trimmed)
      .single();

    setIsLoading(false);

    if (sbError || !data) {
      setError("ORDER_NOT_FOUND // Verify your ID and try again.");
      return;
    }

    setOrder(data as Order);
  };

  const reset = () => {
    setOrder(null);
    setError(null);
  };

  return { order, isLoading, error, trackOrder, reset };
}
