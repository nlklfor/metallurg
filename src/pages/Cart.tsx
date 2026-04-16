import { ArrowLeft, MoveRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import CartItemCard from "@/components/CartItemCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import TrackOrderModal from "@/components/TrackModal";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const totalPriceFn = useCartStore((state) => state.totalPrice);
  const currency = useCurrencyStore((state) => state.currency);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Navbar variant="light" />
      <div className="px-4 sm:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: "Loadout" },
          ]}
        />
      </div>
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-8 sm:pt-12 pb-4 sm:pb-8 flex flex-col">
        <div className="flex items-center justify-between mb-6 sm:mb-10 flex-shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-black transition-colors group flex-shrink-0"
            >
              <ArrowLeft
                size={16}
                className="text-gray-400 group-hover:text-black group-hover:-translate-x-0.5 transition-all"
              />
            </button>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic">
                Loadout
              </h1>
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mt-1">
                // ITEMS_IN_LOADOUT: {cartItems.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setTrackOpen(true)}
            className="text-[10px] text-gray-400 tracking-[0.25em] uppercase border border-gray-200 px-4 py-2 hover:border-black hover:text-black transition-all"
          >
            TRACK_ORDER →
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 relative border border-gray-100 flex flex-col overflow-hidden min-h-0">
            {/* MTL™ watermark — absolute background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <p
                className="font-black text-gray-100 tracking-tighter italic leading-none"
                style={{
                  fontFamily: "'TheNeue', sans-serif",
                  fontSize: "clamp(80px, 22vw, 260px)",
                }}
              >
                MTL™
              </p>
            </div>

            <div className="relative z-10 border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <span className="text-[8px] font-ibm-mono text-gray-300 tracking-[0.4em] uppercase">
                // LOADOUT_MODULE_V2.0
              </span>
              <span className="text-[8px] font-ibm-mono text-gray-300 tracking-widest">
                STATUS: EMPTY
              </span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 gap-3 min-h-0">
              <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase font-ibm-mono">
                // NO_ITEMS_DETECTED
              </p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">
                Loadout is Empty
              </h2>
              <p className="text-xs text-gray-400 font-ibm-mono max-w-sm leading-relaxed">
                No acquisitions queued. Access the inventory to browse the archive and begin your
                selection.
              </p>
              <Button
                onClick={() => navigate("/inventory")}
                className="mt-2 bg-black text-white px-12 py-4 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-800 transition-all rounded-none"
              >
                ACCESS_ARCHIVE →
              </Button>
            </div>

            <div className="relative z-10 border-t border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <span className="text-[8px] font-ibm-mono text-gray-300 tracking-widest">
                METALLURG™ — ARCHIVE_2026
              </span>
              <span className="text-[8px] font-ibm-mono text-gray-300 tracking-widest">
                50.4501° N, 30.5234° E
              </span>
            </div>
          </div>
        ) : (
          <div className="pb-8 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-[8px] text-gray-300 tracking-[0.4em] uppercase mb-4">
                // ITEMS_FOR_EXECUTION
              </p>
              {cartItems.map((item) => (
                <CartItemCard key={`${item.id}-${item.selectedSize}`} item={item} />
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="border border-gray-200 sticky top-24">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase">
                    METALLURG // SUMMARY
                  </span>
                  <span className="text-[8px] text-gray-300 tracking-widest">V2.0</span>
                </div>

                <div className="px-6 py-8 space-y-6">
                  <div className="space-y-3">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-500">
                        <span className="truncate max-w-[60%]">
                          {item.name} <span className="text-gray-300">SZ_{item.selectedSize}</span>
                          {item.cart_quantity > 1 && (
                            <span className="text-gray-300"> ×{item.cart_quantity}</span>
                          )}
                        </span>
                        <span className="text-black">
                          {formatPrice(item.price * item.cart_quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">
                        // subtotal
                      </span>
                      <span className="text-sm text-black">
                        {formatPrice(totalPriceFn(), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">
                        // shipping
                      </span>
                      <span className="text-[10px] text-green-600 font-bold tracking-widest">
                        FREE
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black italic tracking-tight">
                      {formatPrice(totalPriceFn(), currency)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="PROMO_CODE"
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-xs text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors uppercase tracking-[0.2em]"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 hover:text-black transition-colors tracking-widest uppercase">
                      Apply
                    </button>
                  </div>

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full bg-black text-white py-5 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-gray-800 transition-all flex items-center justify-center gap-4 group"
                  >
                    <span>EXECUTE_PROTOCOL</span>
                    <MoveRight
                      size={16}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </button>
                </div>

                <div className="border-t border-gray-200 px-6 py-3 flex justify-between">
                  <span className="text-[8px] text-gray-300 tracking-widest">SECURE_CHECKOUT</span>
                  <span className="text-[8px] text-gray-300 tracking-widest">MTL_STORE_2026</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
