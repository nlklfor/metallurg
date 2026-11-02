import { Link } from "react-router-dom";
import type { CartItem } from "@/interfaces";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import { getMaxQuantity } from "@/utils/stock";
import { cn } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
  /** compact = loadout sidebar; default = loadout page row */
  variant?: "page" | "compact";
  onNavigate?: () => void;
}

const STATUS: Record<CartItem["stock_status"], { label: string; color: string; eta: string }> = {
  pre_order: { label: "PRE_ORDER", color: "text-[#1D4ED8]", eta: "ETA: 10–14 DAYS" },
  in_stock: { label: "IN_STOCK", color: "text-[#15803D]", eta: "READY_TO_SHIP" },
  out_of_stock: { label: "UNAVAILABLE", color: "text-status-error", eta: "REMOVE TO CONTINUE" },
};

// One loadout line (design file: Loadout-D / Loadout-M).
// Page: photo · name/size/status · qty stepper · unit × qty · line total.
// Compact (sidebar): photo · name/size · stepper + remove · line total.
export default function CartItemCard({ item, variant = "page", onNavigate }: CartItemCardProps) {
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const currency = useCurrencyStore((s) => s.currency);

  const status = STATUS[item.stock_status] ?? STATUS.in_stock;
  const unavailable = item.stock_status === "out_of_stock";
  const max = getMaxQuantity(item, item.selectedSize);
  const atMax = item.cart_quantity >= max;
  const atMin = item.cart_quantity <= 1;
  const capText = atMax && max <= 2 && !unavailable ? `LAST_${max} // MAX` : "";
  const compact = variant === "compact";
  const sizeText = item.selectedSize === "ONE_SIZE" ? "ONE_SIZE" : `SIZE ${item.selectedSize}`;

  const stepper = (
    <div className={cn("flex border border-ink", compact ? "h-9 w-[108px]" : "h-11 w-[132px]")}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => decreaseQuantity(item.id, item.selectedSize)}
        disabled={atMin || unavailable}
        className="flex-1 text-[16px] disabled:text-[#D1D5DB]"
      >
        −
      </button>
      <span className="flex flex-1 items-center justify-center border-x border-ink text-[13px] tabular-nums">
        {item.cart_quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => increaseQuantity(item.id, item.selectedSize)}
        disabled={atMax || unavailable}
        className="flex-1 text-[16px] disabled:text-[#D1D5DB]"
      >
        +
      </button>
    </div>
  );

  const remove = (
    <button
      type="button"
      onClick={() => removeFromCart(item.id, item.selectedSize)}
      className="h-6 self-start text-[10px] tracking-[0.15em] text-dim underline underline-offset-[3px] transition-colors hover:text-status-error"
    >
      REMOVE
    </button>
  );

  const photo = (
    <Link
      to={`/product/${item.slug}`}
      onClick={onNavigate}
      className={cn(
        "flex flex-shrink-0 items-center justify-center overflow-hidden border border-rule",
        compact ? "h-[88px] w-[88px]" : "h-24 w-24 lg:h-[120px] lg:w-[120px]"
      )}
    >
      {item.image_url?.[0] && (
        <img
          src={item.image_url[0]}
          alt={item.name}
          className={cn(
            "h-full w-full object-contain p-1.5",
            unavailable && "opacity-40 grayscale"
          )}
        />
      )}
    </Link>
  );

  const lineTotal = formatPrice(item.price * item.cart_quantity, currency);

  if (compact) {
    return (
      <div className="flex gap-3 border-b border-rule py-4">
        {photo}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/product/${item.slug}`}
              onClick={onNavigate}
              className="display line-clamp-2 text-[15px] leading-none"
            >
              {item.name}
            </Link>
            <span className="flex-shrink-0 text-[13px] font-bold tabular-nums">{lineTotal}</span>
          </div>
          <span className="text-[10px] tracking-[0.12em] text-dim">
            // {sizeText} · <span className={status.color}>{status.label}</span>
          </span>
          <div className="mt-auto flex items-center justify-between gap-2">
            {stepper}
            {remove}
          </div>
          {capText && (
            <span className="text-[9px] tracking-[0.12em] text-status-low">{capText}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-rule py-5 lg:grid-cols-[120px_minmax(0,1fr)_140px_150px_160px] lg:items-center lg:gap-5">
      {photo}
      <div className="flex min-w-0 flex-col gap-2">
        <Link
          to={`/product/${item.slug}`}
          className="display text-[18px] leading-none lg:text-[22px]"
        >
          {item.name}
        </Link>
        <span className="text-[11px] tracking-[0.12em] text-dim">
          // {sizeText} · <span className={status.color}>{status.label}</span>
        </span>
        <span className="text-[11px] text-dim">{status.eta}</span>
        <span className="text-[14px] font-bold tabular-nums lg:hidden">{lineTotal}</span>
        {remove}
      </div>
      <div className="col-start-2 flex flex-col gap-1.5 lg:col-start-auto">
        {stepper}
        {capText && <span className="text-[9px] tracking-[0.12em] text-status-low">{capText}</span>}
      </div>
      <span className="hidden text-[13px] tabular-nums text-[#374151] lg:block">
        {formatPrice(item.price, currency)} × {item.cart_quantity}
      </span>
      <span className="hidden text-right text-[16px] font-bold tabular-nums lg:block">
        {lineTotal}
      </span>
    </div>
  );
}
