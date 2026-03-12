import type { ShippingZone, TrackStepDefinition } from "@/interfaces";
import { Package, Wrench, Truck, Globe, MapPin, CheckCircle, Archive, Clock } from "lucide-react";

// ─── Shipping ─────────────────────────────────────────────────────────────────

export const SHIPPING_ZONES: ShippingZone[] = ["Ukraine", "Switzerland", "International"];

// ─── Tracking Routes ──────────────────────────────────────────────────────────

export const INTERNATIONAL_ROUTE: TrackStepDefinition[] = [
  {
    label: "ORDER_ACCEPTED",
    sublabel: "We received your order",
    icon: Package,
  },
  { label: "PROCESSING", sublabel: "Preparing your items", icon: Wrench },
  {
    label: "IN_TRANSIT_TO_HUB",
    sublabel: "Moving to dispatch center",
    icon: Truck,
  },
  { label: "BORDER_CROSSING", sublabel: "Customs clearance", icon: Globe },
  {
    label: "ARRIVED_IN_UKRAINE",
    sublabel: "Landed, final mile delivery",
    icon: MapPin,
  },
  {
    label: "DELIVERED_TO_NP",
    sublabel: "Available at Nova Poshta",
    icon: CheckCircle,
  },
];

export const LOCAL_ROUTE: TrackStepDefinition[] = [
  {
    label: "ORDER_ACCEPTED",
    sublabel: "We received your order",
    icon: Package,
  },
  { label: "PACKING", sublabel: "Your order is being packed", icon: Archive },
  {
    label: "READY_FOR_PICKUP",
    sublabel: "Waiting for courier handoff",
    icon: Clock,
  },
  {
    label: "HANDED_TO_RESIDENT",
    sublabel: "Delivered to your address",
    icon: CheckCircle,
  },
];

// ─── Status Labels & Colors ───────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  waiting_for_payment: "WAITING_FOR_PAYMENT",
  paid: "PAYMENT_CONFIRMED",
  processing: "PROCESSING_ORDER",
  shipped: "SHIPPED",
  completed: "DELIVERED",
  cancelled: "CANCELLED",
};

export const STATUS_COLORS: Record<string, string> = {
  waiting_for_payment: "text-yellow-500",
  paid: "text-blue-500",
  processing: "text-blue-500",
  shipped: "text-green-500",
  completed: "text-green-600",
  cancelled: "text-red-500",
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const EDGE_FUNCTION_URL =
  "https://ytynsqcxteyufoynvsir.supabase.co/functions/v1/notify-telegram";

// Navigation
export { MAIN_PAGE_BTNS, MAIN_PAGE_LINKS, NAV_LINKS, FOOTER_LINKS } from "./navigation";

// Site
export { SITE_CONFIG } from "./site";

// Filters
export { DEFAULT_FILTERS } from "./filters";
