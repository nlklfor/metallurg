import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_OG_IMAGE, ROUTE_META, SITE_NAME, absoluteUrl, type PageMeta } from "@/lib/seo";

interface SeoProps {
  title?: string;
  description?: string;
  /** Overrides ROUTE_META; false → noindex */
  index?: boolean;
  image?: string;
  /** Canonical path; defaults to the current path without query/hash */
  path?: string;
  type?: "website" | "product";
  /** One or more schema.org objects */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Sets title, description, canonical, robots, Open Graph, Twitter card and
// JSON-LD for the current page. Updates the tags index.html ships with, so
// there is never a duplicate. Crawlers that skip JavaScript get the same
// tags from /api/meta (see vercel.json).
export default function Seo(props: SeoProps) {
  const { pathname } = useLocation();
  const base: PageMeta = ROUTE_META[pathname] ?? {
    title: SITE_NAME,
    description: ROUTE_META["/"].description,
    index: true,
  };
  const title = props.title ?? base.title;
  const description = props.description ?? base.description;
  const index = props.index ?? base.index;
  const url = absoluteUrl(props.path ?? pathname);
  const image = absoluteUrl(props.image ?? DEFAULT_OG_IMAGE);
  const type = props.type ?? "website";
  const jsonLd = props.jsonLd ? JSON.stringify(props.jsonLd) : "";

  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      index ? "index, follow, max-image-preview:large" : "noindex, follow"
    );
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    let script = document.getElementById("ld-page") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "ld-page";
        document.head.appendChild(script);
      }
      script.textContent = jsonLd;
    } else if (script) {
      script.remove();
    }
  }, [title, description, index, url, image, type, jsonLd]);

  return null;
}
