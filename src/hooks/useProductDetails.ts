import { getProductBySlug } from "@/api/products";
import type { ProductType } from "@/interfaces";
import { useEffect, useState } from "react";

export const useProductDetails = (slug: string | undefined) => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, isLoading, error };
};
