import { useState, useEffect, useCallback } from "react";
import { getAllReviews } from "@/api/reviews";
import type { ReviewWithOrderItems } from "@/interfaces/review";
import { ARCHIVE_REVIEWS } from "@/lib/constants/archiveReviews";

/** Site reviews + reviews sent before the site had a form, newest first. */
function withArchive(site: ReviewWithOrderItems[]): ReviewWithOrderItems[] {
  return [...site, ...ARCHIVE_REVIEWS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

const statsOf = (list: ReviewWithOrderItems[]) =>
  list.length > 0
    ? { average: list.reduce((acc, r) => acc + r.rating, 0) / list.length, count: list.length }
    : { average: 0, count: 0 };

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
      const data = withArchive(await getAllReviews());
      setReviews(data);
      setStats(statsOf(data));
    } catch {
      // Site reviews failed to load: still show the archive ones.
      setReviews(withArchive([]));
      setStats(statsOf(withArchive([])));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, stats, isLoading, refetch: fetchReviews };
}
