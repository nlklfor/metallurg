export const MAIN_PAGE_BTNS = [
  { label: "[ INVENTORY ]", href: "/inventory" },
  { label: "[ CONTACT ]", href: "/contact" },
  { label: "[ ABOUT ]", href: "/about" },
  { label: "[ ORDERS & REVIEWS ]", href: "/orders" },
];

export const MAIN_PAGE_LINKS = [
  { href: "https://www.instagram.com/metallurg.tm", label: "INSTAGRAM @metallurg.tm" },
  { href: "https://t.me/+W3cgJ6lB7_s0ODMy", label: "TELEGRAM_CHANNEL" },
  { href: "https://t.me/metallurgTm_bot", label: "TELEGRAM_BOT" },
  { href: "https://linkbio.co/metallurg", label: "linkbio.co/metallurg" },
  { href: "https://open.spotify.com/playlist/2g4MwiVghEPSOBAnUAGxPH", label: "SPOTIFY_PLAYLIST" },
];

// Telegram bot: order tracking, FAQ, and per-order status updates
// (t.me/<bot>?start=<ORDER_NUMBER> subscribes the chat to that order).
export const TELEGRAM_BOT = "metallurgTm_bot";
export const telegramOrderLink = (orderNumber: string) =>
  `https://t.me/${TELEGRAM_BOT}?start=${encodeURIComponent(orderNumber)}`;

// Node coordinates used across the brand surfaces (landing, footer, gate).
export const NODES = {
  ua: { city: "KYIV, UKRAINE", coords: "50.4501° N, 30.5234° E" },
  ch: { city: "ZÜRICH, SWITZERLAND", coords: "47.3769° N, 8.5417° E" },
} as const;

export const NAV_LINKS = [
  { label: "INVENTORY", href: "/inventory" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
  { label: "ORDERS & REVIEWS", href: "/orders" },
];
