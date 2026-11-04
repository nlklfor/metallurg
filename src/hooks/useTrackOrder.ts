import { useState } from "react";
import type { Order } from "@/interfaces";
import { TRACK_URL as EDGE_URL } from "@/lib/constants/order";
import { rememberOrder, toOrderNumber } from "@/utils/trackUtils";

export type TrackError = "not_found" | "rate_limited" | "network";

export function useTrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TrackError | null>(null);

  /** Look up an order by its code ("7K2QPX") or full number ("MTL-7K2QPX"). */
  const trackOrder = async (code: string) => {
    const orderNumber = toOrderNumber(code);
    if (orderNumber === "MTL-") return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 429) return setError("rate_limited");
      if (!res.ok || json.error) return setError("not_found");

      setOrder(json as Order);
      rememberOrder((json as Order).order_number ?? orderNumber);
    } catch {
      setError("network");
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
