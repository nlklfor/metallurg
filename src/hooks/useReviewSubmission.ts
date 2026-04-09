import { useState, useEffect, useCallback } from "react";
import { submitReview, getReviewByOrder } from "@/api/reviews";
import type { ReviewFormData } from "@/interfaces/review";

interface UseReviewSubmissionParams {
  isOpen: boolean;
  orderId: string;
}

export function useReviewSubmission({ isOpen, orderId }: UseReviewSubmissionParams) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAlreadyReviewed, setIsAlreadyReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const check = async () => {
      setIsChecking(true);
      try {
        const existing = await getReviewByOrder(orderId);
        setIsAlreadyReviewed(!!existing);
      } catch {
        setError("Failed to check review status.");
      } finally {
        setIsChecking(false);
      }
    };

    check();
  }, [isOpen, orderId]);

  const submit = useCallback(async (formData: ReviewFormData, images: File[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitReview(formData, images);
      setIsSubmitting(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed.";
      setError(message);
      setIsSubmitting(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsAlreadyReviewed(false);
    setIsChecking(false);
    setError(null);
    setIsSubmitting(false);
  }, []);

  return { isChecking, isAlreadyReviewed, isSubmitting, error, submit, reset };
}
