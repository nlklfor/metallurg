import { SITEMAP_ROUTES, absoluteUrl } from "../src/lib/seo";
import { escapeHtml, selectProducts } from "./_supabase";

export const config = { runtime: "edge" };

// /sitemap.xml (rewritten here in vercel.json): static pages + every product.
export default async function handler(): Promise<Response> {
  const today = new Date().toISOString().slice(0, 10);
  const urls: string[] = SITEMAP_ROUTES.map(
    (path) =>
      `  <url><loc>${absoluteUrl(path)}</loc><lastmod>${today}</lastmod><changefreq>${
        path === "/inventory" ? "daily" : "weekly"
      }</changefreq><priority>${path === "/" || path === "/inventory" ? "1.0" : "0.6"}</priority></url>`
  );

  try {
    const products = await selectProducts(
      "select=slug,name,image_url,created_at,stock_status&order=created_at.desc"
    );
    for (const p of products) {
      const image = p.image_url?.[0]
        ? `<image:image><image:loc>${escapeHtml(p.image_url[0])}</image:loc><image:title>${escapeHtml(
            p.name
          )}</image:title></image:image>`
        : "";
      urls.push(
        `  <url><loc>${absoluteUrl(`/product/${encodeURIComponent(p.slug)}`)}</loc><lastmod>${p.created_at.slice(
          0,
          10
        )}</lastmod><changefreq>${p.stock_status === "out_of_stock" ? "monthly" : "weekly"}</changefreq><priority>0.8</priority>${image}</url>`
      );
    }
  } catch {
    // Static pages still go out if the database is unreachable.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
