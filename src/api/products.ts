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

export const getProductById = async (id: string): Promise<ProductType | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single(); // using .single() to get a single record instead of an array

  if (error) throw new Error(error.message);
  return data;
};
