// Shared SEO data. Used by the <Seo> component in the browser and by the
// /api/meta function, which serves the same tags to crawlers and link-preview
// bots (Telegram, Instagram, Google…) that do not run JavaScript.
// No imports here: /api functions import this file directly.

export const SITE_NAME = "METALLURG™";

/** Public origin, no trailing slash. Set VITE_SITE_URL once the custom domain is live. */
// Browser build: import.meta.env. Vercel functions: process.env.
const envSiteUrl =
  (import.meta.env?.VITE_SITE_URL as string | undefined) ??
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.VITE_SITE_URL;

export const SITE_URL = (envSiteUrl || "https://metallurg.vercel.app").replace(/\/+$/, "");

export const DEFAULT_OG_IMAGE = "/og-default.png";

export interface PageMeta {
  title: string;
  description: string;
  /** false → <meta name="robots" content="noindex, follow"> and left out of the sitemap */
  index: boolean;
}

export const DEFAULT_META: PageMeta = {
  title: "METALLURG™ — Sneaker & Streetwear Archive · Kyiv ↔ Zürich",
  description:
    "Verified sneakers and streetwear sourced in Switzerland and delivered across Ukraine by Nova Poshta. Pick from stock or pre-order with 10–14 day delivery.",
  index: true,
};

/** Static routes. Keys are exact paths. */
export const ROUTE_META: Record<string, PageMeta> = {
  "/": DEFAULT_META,
  "/inventory": {
    title: "Inventory — METALLURG™",
    description:
      "Every object in the METALLURG™ archive: sneakers, hoodies and accessories, in stock or on pre-order with 10–14 day delivery across Ukraine.",
    index: true,
  },
  "/about": {
    title: "About — METALLURG™",
    description:
      "METALLURG™ is a small archive moving verified sneakers and streetwear between Zürich and Kyiv. Every pair is checked before it ships.",
    index: true,
  },
  "/contact": {
    title: "Contact — METALLURG™",
    description:
      "Write to METALLURG™ on Telegram or Instagram, or send a message from the site. Questions about sizes, orders and requests.",
    index: true,
  },
  "/orders": {
    title: "Orders & Reviews — METALLURG™",
    description:
      "Recent deliveries and field reports from METALLURG™ residents, with photos and ratings. Track your own order by its number.",
    index: true,
  },
  "/protocol": {
    title: "Protocol — METALLURG™",
    description:
      "How ordering, payment, delivery, authenticity checks and data handling work at METALLURG™.",
    index: true,
  },
  "/loadout": {
    title: "Loadout — METALLURG™",
    description: "Objects you have selected.",
    index: false,
  },
  "/gate/mtl-ch-ua": {
    title: "METALLURG™",
    description: DEFAULT_META.description,
    index: false,
  },
};

/** Routes listed in sitemap.xml (indexable static pages). */
export const SITEMAP_ROUTES = Object.entries(ROUTE_META)
  .filter(([, m]) => m.index)
  .map(([path]) => path);

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Plain text, collapsed whitespace, cut at a word boundary. */
export function clip(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trim()}…`;
}

export interface ProductSeoInput {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  image_url?: string[] | null;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  sku?: string | null;
  category?: string | null;
  condition?: string | null;
}

const AVAILABILITY: Record<ProductSeoInput["stock_status"], string> = {
  in_stock: "https://schema.org/InStock",
  pre_order: "https://schema.org/PreOrder",
  out_of_stock: "https://schema.org/OutOfStock",
};

export function productMeta(p: ProductSeoInput): PageMeta & { image?: string } {
  const status =
    p.stock_status === "in_stock"
      ? "In stock"
      : p.stock_status === "pre_order"
        ? "Pre-order, 10–14 days"
        : "Archived";
  const lead = `${p.name} — ${p.price.toLocaleString("en-US")} UAH. ${status}. Verified before dispatch, delivered by Nova Poshta.`;
  return {
    title: `${p.name} — METALLURG™`,
    description: clip(p.description ? `${lead} ${p.description}` : lead),
    index: true,
    image: p.image_url?.[0],
  };
}

export function productJsonLd(p: ProductSeoInput): Record<string, unknown> {
  const url = absoluteUrl(`/product/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
    image: (p.image_url ?? []).slice(0, 5),
    description: p.description ? clip(p.description, 500) : undefined,
    sku: p.sku ?? undefined,
    category: p.category ?? undefined,
    offers: {
      "@type": "Offer",
      url,
      price: p.price,
      priceCurrency: "UAH",
      availability: AVAILABILITY[p.stock_status],
      itemCondition: /new/i.test(p.condition ?? "new")
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
