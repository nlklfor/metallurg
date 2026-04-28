import { useState } from "react";
import type { Order } from "@/interfaces";

const EDGE_URL = "https://ytynsqcxteyufoynvsir.supabase.co/functions/v1/track-order";

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

    try {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: trimmed }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError("ORDER_NOT_FOUND // Verify your ID and try again.");
        return;
      }

      setOrder(json as Order);
    } catch {
      setError("ORDER_NOT_FOUND // Verify your ID and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setOrder(null);
    setError(null);
  };

  return { order, isLoading, error, trackOrder, reset };
}
