import {
  DEFAULT_OG_IMAGE,
  ROUTE_META,
  absoluteUrl,
  breadcrumbJsonLd,
  productJsonLd,
  productMeta,
  type PageMeta,
} from "../src/lib/seo";
import { escapeHtml, selectProducts } from "./_supabase";

export const config = { runtime: "edge" };

// Crawlers and link-preview bots (vercel.json sends them here) get the real
// index.html with this page's title, description, canonical, Open Graph,
// Twitter card and JSON-LD already in <head>, plus a short text version of the
// page in #root. Same page as people get, so the tags match what React sets.
// Unknown paths and unknown products answer 404 with noindex.

interface Resolved {
  status: number;
  meta: PageMeta;
  image: string;
  type: "website" | "product";
  jsonLd: Record<string, unknown>[];
  bodyText: string;
}

const NOT_FOUND: PageMeta = {
  title: "Not found — METALLURG™",
  description: "This page is not in the archive.",
  index: false,
};

async function resolve(path: string): Promise<Resolved> {
  const fixed = ROUTE_META[path];
  if (fixed) {
    return {
      status: 200,
      meta: fixed,
      image: absoluteUrl(DEFAULT_OG_IMAGE),
      type: "website",
      jsonLd: [],
      bodyText: fixed.description,
    };
  }

  const m = path.match(/^\/product\/([^/]+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    try {
      const [p] = await selectProducts(
        `select=name,slug,description,price,image_url,stock_status,sku,category,condition,created_at&slug=eq.${encodeURIComponent(
          slug
        )}&limit=1`
      );
      if (p) {
        const meta = productMeta(p);
        return {
          status: 200,
          meta,
          image: meta.image ? absoluteUrl(meta.image) : absoluteUrl(DEFAULT_OG_IMAGE),
          type: "product",
          jsonLd: [
            productJsonLd(p),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Inventory", path: "/inventory" },
              { name: p.name, path: `/product/${p.slug}` },
            ]),
          ],
          bodyText: p.description ?? meta.description,
        };
      }
    } catch {
      // Database unreachable: fall back to a generic page, not a 404.
      return {
        status: 200,
        meta: ROUTE_META["/inventory"],
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        type: "website",
        jsonLd: [],
        bodyText: ROUTE_META["/inventory"].description,
      };
    }
  }

  return {
    status: 404,
    meta: NOT_FOUND,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    type: "website",
    jsonLd: [],
    bodyText: NOT_FOUND.description,
  };
}

function headTags(path: string, r: Resolved): string {
  const t = escapeHtml(r.meta.title);
  const d = escapeHtml(r.meta.description);
  const url = escapeHtml(absoluteUrl(path));
  const img = escapeHtml(r.image);
  const robots = r.meta.index ? "index, follow, max-image-preview:large" : "noindex, follow";
  const ld = r.jsonLd.length
    ? `<script type="application/ld+json" id="ld-page">${JSON.stringify(r.jsonLd).replace(/</g, "\\u003c")}</script>`
    : "";
  return `<title>${t}</title>
    <meta name="description" content="${d}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${r.type}" />
    <meta property="og:site_name" content="METALLURG™" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:alt" content="${t}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    ${ld}`;
}

export default async function handler(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  let path = reqUrl.searchParams.get("path") || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");

  const [shellRes, r] = await Promise.all([
    fetch(new URL("/index.html", reqUrl.origin)),
    resolve(path),
  ]);
  let html = await shellRes.text();

  html = html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, headTags(path, r));
  html = html.replace(
    "<!--seo:body-->",
    `<main><h1>${escapeHtml(r.meta.title)}</h1><p>${escapeHtml(r.bodyText)}</p><nav><a href="/inventory">Inventory</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/orders">Orders &amp; Reviews</a></nav></main>`
  );

  return new Response(html, {
    status: r.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      ...(r.meta.index ? {} : { "X-Robots-Tag": "noindex" }),
    },
  });
}
