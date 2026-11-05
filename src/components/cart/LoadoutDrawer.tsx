import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartItemCard from "@/components/cart/CartItemCard";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import { useLoadoutDrawer } from "@/stores/useLoadoutDrawer";
import { DURATION, EASE_MTL } from "@/lib/motion";

const pad2 = (n: number) => String(n).padStart(2, "0");

// Loadout sidebar (desktop). Opens from the navbar LOADOUT button, slides in
// from the right over a dimmed page. OPEN_LOADOUT goes to the page; CHECKOUT
// goes to the page with the checkout already open.
export default function LoadoutDrawer() {
  const { open, setOpen } = useLoadoutDrawer();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice());
  const currency = useCurrencyStore((s) => s.currency);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const units = items.reduce((n, i) => n + (i.cart_quantity ?? 1), 0);
  const close = () => setOpen(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[70] hidden font-mono md:block"
          role="dialog"
          aria-modal="true"
          aria-label="Loadout"
        >
          <motion.div
            className="absolute inset-0 bg-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.page }}
            onClick={close}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[440px] max-w-full flex-col border-l border-ink bg-paper text-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: DURATION.modal, ease: EASE_MTL }}
          >
            <div className="flex h-bar flex-shrink-0 items-center justify-between border-b border-rule px-6">
              <span className="eyebrow">// LOADOUT [ {units} ]</span>
              <button
                type="button"
                onClick={close}
                className="h-11 text-[11px] tracking-[0.15em] hover:text-dim"
              >
                [ CLOSE ]
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-8 text-center">
                <p aria-hidden="true" className="text-[12px] tracking-[0.15em] text-dim-dark">
                  ░░░░░░░░
                </p>
                <p className="display text-[34px]">Cart_empty</p>
                <p className="text-[11px] tracking-[0.15em] text-dim">NO_ITEMS_DETECTED</p>
                <Link
                  to="/inventory"
                  onClick={close}
                  className="mt-1.5 flex h-[52px] w-full items-center justify-center bg-ink text-[12px] font-bold tracking-[0.15em] !text-paper hover:bg-[#222]"
                >
                  BROWSE →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between px-6 pt-4 text-[10px] tracking-[0.15em] text-dim">
                  <span>
                    {pad2(items.length)} LINES / {pad2(units)} UNITS
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-6">
                  {items.map((item) => (
                    <CartItemCard
                      key={`${item.id}-${item.selectedSize}`}
                      item={item}
                      variant="compact"
                      onNavigate={close}
                    />
                  ))}
                </div>
                <div className="flex flex-shrink-0 flex-col gap-3 border-t border-ink px-6 pb-6 pt-4">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-dim">SUBTOTAL</span>
                    <span className="tabular-nums">{formatPrice(total, currency)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-dim">DELIVERY</span>
                    <span className="text-[10px] tracking-[0.1em]">CALCULATED_AT_CHECKOUT</span>
                  </div>
                  <Link
                    to="/loadout"
                    onClick={close}
                    className="mt-1 flex h-14 items-center justify-center bg-ink text-[12px] font-bold tracking-[0.15em] !text-paper transition-colors hover:bg-[#222]"
                  >
                    OPEN_LOADOUT →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate("/loadout?checkout=1");
                    }}
                    className="flex h-12 items-center justify-center border border-ink text-[11px] tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    CHECKOUT / {formatPrice(total, currency)}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
