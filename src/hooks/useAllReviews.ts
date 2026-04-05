import { useState, useEffect, useCallback } from "react";
import { getAllReviews } from "@/api/reviews";
import type { ReviewWithOrderItems } from "@/interfaces/review";

export function useAllReviews() {
  const [reviews, setReviews] = useState<ReviewWithOrderItems[]>([]);
  const [stats, setStats] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);

      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setStats({ average: sum / data.length, count: data.length });
      } else {
        setStats({ average: 0, count: 0 });
      }
    } catch {
      setReviews([]);
      setStats({ average: 0, count: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, stats, isLoading, refetch: fetchReviews };
}
