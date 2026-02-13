import type { FilterOptions } from "@/interfaces";

export const MAIN_PAGE_BTNS = [
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
  { label: "News", href: "/news" },
  { label: "Orders & Reviews", href: "/orders" },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
  { label: "News", href: "/news" },
  { label: "Orders & Reviews", href: "/orders" },
];

export const FOOTER_LINKS = {
  faq: [
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Sizing Guide", href: "#" },
  ],
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Sale", href: "/shop?filter=sale" },
  ],
  legal: [
    { label: "Privacy & Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export const SITE_CONFIG = {
  name: "METALLURG™",
  copyright: "© 2026 METALLURG™. All rights reserved.",
  spotifyPlaylist:
    "https://open.spotify.com/embed/playlist/2g4MwiVghEPSOBAnUAGxPH",
};

export const REVIEW_ITEMS = [
  {
    name: "Alex K.",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    review:
      "Amazing quality! The hoodie fits perfectly and the material is super comfortable. Best streetwear brand I've found.",
    date: "Feb 2, 2026",
  },
  {
    name: "Maria S.",
    avatar: "https://i.pravatar.cc/100?img=5",
    rating: 5,
    review:
      "Fast shipping and the packaging was really nice. Will definitely order again. The attention to detail is incredible.",
    date: "Jan 28, 2026",
  },
  {
    name: "James T.",
    avatar: "https://i.pravatar.cc/100?img=3",
    rating: 4,
    review:
      "Great design, exactly as pictured. Sizing runs a bit large though. Customer service was super helpful.",
    date: "Jan 15, 2026",
  },
  {
    name: "Sophie L.",
    avatar: "https://i.pravatar.cc/100?img=9",
    rating: 5,
    review:
      "The quality exceeded my expectations. These pieces are now my go-to for everyday wear. Highly recommend!",
    date: "Jan 10, 2026",
  },
];

export const DEFAULT_FILTERS: FilterOptions = {
  sortBy: "newest",
  sizes: [],
  priceRange: [0, 50000],
};
