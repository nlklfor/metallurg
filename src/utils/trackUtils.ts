// Helpers for the Track modal: order-code input, masking, and the
// "recent on this device" list.

const PREFIX = /^\s*MTL[-\s]?/i;

/** What the customer typed or pasted → the code after "MTL-" (uppercase, A–Z/0–9, max 8). */
export function normalizeOrderCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(PREFIX, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

/** Full order number for a code: "7k2qpx" → "MTL-7K2QPX". */
export const toOrderNumber = (code: string) => `MTL-${normalizeOrderCode(code)}`;

/** "20450000000000" → "20 45 •••• •••• 00". Short or empty values pass through. */
export function maskTtn(ttn: string | null | undefined): string {
  const digits = (ttn ?? "").replace(/\s/g, "");
  if (digits.length < 8) return digits;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} •••• •••• ${digits.slice(-2)}`;
}

/** "Roman Novak" → "R. N•••••"; one word → "R•••••". */
export function maskName(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  const first = parts[0][0].toUpperCase();
  if (parts.length === 1) return `${first}•••••`;
  return `${first}. ${parts[parts.length - 1][0].toUpperCase()}•••••`;
}

/** "2026-10-13T14:02:00Z" → "13.10 · 14:02" (local time). */
export function formatStamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Nova Poshta's public tracking page for a TTN. */
export const npUrl = (ttn: string) =>
  `https://novaposhta.ua/tracking/?cargo_number=${encodeURIComponent(ttn)}`;

// ─── Recent on this device ──────────────────────────────────────────────────

export interface RecentOrder {
  orderNumber: string;
  at: string;
}

const RECENT_KEY = "mtl:recent-orders";
const RECENT_MAX = 3;

export function readRecentOrders(): RecentOrder[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as RecentOrder[]) : [];
    return Array.isArray(list) ? list.filter((r) => typeof r?.orderNumber === "string") : [];
  } catch {
    return [];
  }
}

export function rememberOrder(orderNumber: string, at = new Date().toISOString()): RecentOrder[] {
  const next = [
    { orderNumber, at },
    ...readRecentOrders().filter((r) => r.orderNumber !== orderNumber),
  ].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: the list just isn't kept */
  }
  return next;
}
