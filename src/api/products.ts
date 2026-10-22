import type { ProductType } from "@/interfaces";
import supabase from "@/lib/supabase";

export const getProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getProductBySlug = async (slug: string): Promise<ProductType | null> => {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();

  if (error) throw new Error(error.message);
  return data;
};
