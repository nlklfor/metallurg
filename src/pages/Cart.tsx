import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import CartItemCard from "@/components/cart/CartItemCard";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import TrackOrderModal from "@/components/tracking/TrackModal";
import Navbar from "@/components/layout/Navbar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Footer from "@/components/layout/Footer";
import Wordmark from "@/components/brand/Wordmark";
import { getProducts } from "@/api/products";
import type { ProductType } from "@/interfaces";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Short name for the summary list: "Air Jordan 4 Rare Air" → "AIR JORDAN 4 RARE…". */
const shortName = (name: string) => (name.length > 22 ? `${name.slice(0, 21).trim()}…` : name);

function useFeaturedObject(enabled: boolean) {
  const [featured, setFeatured] = useState<ProductType | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    getProducts()
      .then((list: ProductType[]) => {
        if (!alive) return;
        setFeatured(list.find((p) => p.stock_status !== "out_of_stock") ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enabled]);
  return featured;
}

// Loadout (design file: Loadout-D / Loadout-M / LoadoutStates 01).
export default function Cart() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice());
  const currency = useCurrencyStore((s) => s.currency);
  const [params, setParams] = useSearchParams();
  // ?checkout=1 (from the loadout sidebar) opens checkout straight away.
  const [checkoutOpen, setCheckoutOpen] = useState(
    () => params.get("checkout") === "1" && items.length > 0
  );
  const [trackOpen, setTrackOpen] = useState(false);
  const units = items.reduce((n, i) => n + (i.cart_quantity ?? 1), 0);
  const hasUnavailable = items.some((i) => i.stock_status === "out_of_stock");
  const featured = useFeaturedObject(items.length === 0);

  useEffect(() => {
    if (params.has("checkout")) setParams({}, { replace: true });
  }, [params, setParams]);

  return (
    <div className="flex min-h-screen flex-col bg-paper font-mono text-ink">
      <Navbar variant="light" />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: "Loadout" },
          ]}
        />
      </div>

      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <p className="eyebrow text-[9px] text-dim lg:text-[10px]">// LOADOUT_MANIFEST</p>
        <div className="flex items-end justify-between gap-6">
          <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">Loadout</h1>
          {items.length > 0 && (
            <span className="hidden pb-2 text-[10px] tracking-[0.15em] text-dim sm:block lg:text-[11px]">
              {pad2(items.length)} LINES · {pad2(units)} UNITS
            </span>
          )}
        </div>
        <div className="h-px bg-ink" />
        {items.length > 0 && (
          <span className="text-[10px] tracking-[0.15em] text-dim sm:hidden">
            {pad2(items.length)} LINES · {pad2(units)} UNITS
          </span>
        )}
      </header>

      {items.length === 0 ? (
        <div className="grid grid-cols-1 gap-8 px-4 pb-16 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
          <div className="flex flex-col items-center gap-3.5 border border-dashed border-dim-dark px-5 py-8 text-center lg:py-16">
            <p aria-hidden="true" className="text-[12px] tracking-[0.3em] text-dim-dark">
              ░░░░░░░░
            </p>
            <p className="eyebrow text-dim">// STATUS</p>
            <h2 className="display text-[34px] lg:text-[48px]">Cart_empty</h2>
            <p className="text-[11px] tracking-[0.15em] text-dim">NO_ITEMS_DETECTED</p>
            <Link
              to="/inventory"
              className="mt-1.5 flex h-[52px] w-full max-w-[360px] items-center justify-center bg-ink text-[12px] font-bold tracking-[0.2em] !text-paper hover:bg-[#222]"
            >
              BROWSE →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {featured && (
              <>
                <p className="eyebrow text-[9px] text-dim">// FEATURED_OBJECT</p>
                <Link
                  to={`/product/${featured.slug}`}
                  className="flex border border-rule transition-colors hover:border-ink"
                >
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center border-r border-rule">
                    <img
                      src={featured.image_url?.[0]}
                      alt={featured.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5 p-3">
                    <span className="display line-clamp-2 text-[16px] leading-none">
                      {featured.name}
                    </span>
                    <span className="text-[12px]">{formatPrice(featured.price, currency)}</span>
                    <span
                      className={
                        featured.stock_status === "pre_order"
                          ? "text-[10px] tracking-[0.1em] text-[#1D4ED8]"
                          : "text-[10px] tracking-[0.1em] text-[#15803D]"
                      }
                    >
                      {featured.stock_status === "pre_order" ? "PRE_ORDER" : "IN_STOCK"}
                    </span>
                  </div>
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setTrackOpen(true)}
              className="mt-2 h-11 self-start text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
            >
              ALREADY ORDERED? TRACK_ORDER →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 px-4 pb-16 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
          {/* Lines */}
          <div className="flex min-w-0 flex-col">
            <div className="hidden grid-cols-[120px_minmax(0,1fr)_140px_150px_160px] gap-5 border-b border-ink pb-3 text-[9px] tracking-[0.2em] text-dim lg:grid">
              <span>OBJECT</span>
              <span />
              <span>QTY</span>
              <span>UNIT × QTY</span>
              <span className="text-right">LINE_TOTAL</span>
            </div>
            <div>
              {items.map((item) => (
                <CartItemCard key={`${item.id}-${item.selectedSize}`} item={item} />
              ))}
            </div>
            <Link
              to="/inventory"
              className="mt-5 self-start py-2 text-[11px] tracking-[0.15em] !text-dim hover:!text-ink"
            >
              ← CONTINUE_BROWSING
            </Link>
          </div>

          {/* Summary */}
          <aside className="flex flex-col gap-4 self-start border border-ink p-5 lg:sticky lg:top-[88px] lg:p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[22px]">
                <Wordmark />
              </span>
              <span className="eyebrow text-[9px] text-dim">// SUMMARY</span>
            </div>
            <div className="h-px bg-ink" />
            <ul className="flex flex-col gap-2.5 text-[12px]">
              {items.map((item) => (
                <li key={`${item.id}-${item.selectedSize}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate uppercase">
                    {shortName(item.name)}
                    {item.selectedSize !== "ONE_SIZE" && ` // ${item.selectedSize}`}{" "}
                    <span className="text-dim">×{item.cart_quantity}</span>
                  </span>
                  <span className="flex-shrink-0 tabular-nums">
                    {formatPrice(item.price * item.cart_quantity, currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="h-px bg-rule" />
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-dim">SUBTOTAL</span>
                <span className="tabular-nums">{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-dim">DELIVERY</span>
                <span className="text-right text-[11px] tracking-[0.1em]">
                  CALCULATED_AT_CHECKOUT
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink pt-3.5">
              <span className="text-[11px] tracking-[0.2em]">TOTAL</span>
              <span className="text-[24px] font-bold tabular-nums lg:text-[28px]">
                {formatPrice(total, currency)}
              </span>
            </div>
            {hasUnavailable && (
              <p className="text-[11px] leading-relaxed text-status-error">
                Some objects are no longer available. Remove them to continue.
              </p>
            )}
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              disabled={hasUnavailable}
              className="flex h-[60px] items-center justify-center bg-ink text-[13px] font-bold tracking-[0.2em] text-paper transition-colors hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-40"
            >
              CHECKOUT →
            </button>
            <button
              type="button"
              onClick={() => setTrackOpen(true)}
              className="flex h-8 items-center justify-center text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
            >
              TRACK_ORDER →
            </button>
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
}
