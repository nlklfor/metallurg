// Read-only access to public product data for the SEO functions.
// Uses the same public (anon) key as the site; RLS applies.

export interface ProductRow {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string[] | null;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  sku: string | null;
  category: string | null;
  condition: string | null;
  created_at: string;
}

const env = (key: string) =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key];

export async function selectProducts(query: string): Promise<ProductRow[]> {
  const url = env("VITE_SUPABASE_URL");
  const key = env("VITE_SUPABASE_KEY");
  if (!url || !key) throw new Error("Supabase env vars are missing");
  const res = await fetch(`${url}/rest/v1/products?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return (await res.json()) as ProductRow[];
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
