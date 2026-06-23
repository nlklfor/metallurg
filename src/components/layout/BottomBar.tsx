import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import SearchModal from "@/components/search/SearchModal";
import TrackOrderModal from "@/components/tracking/TrackModal";

const EXACT_ROUTES = ["/inventory", "/contact", "/about", "/orders", "/loadout"];

export default function BottomBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.cart_quantity, 0);

  const { pathname } = location;
  const visible = EXACT_ROUTES.includes(pathname) || pathname.startsWith("/product/");
  if (!visible) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive("/") ? "text-black" : "text-gray-400"
            }`}
          >
            <Home size={20} strokeWidth={isActive("/") ? 2.5 : 1.5} />
            <span className="text-[8px] font-ibm-mono uppercase tracking-[0.15em]">Home</span>
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-400 transition-colors active:text-black"
          >
            <Search size={20} strokeWidth={1.5} />
            <span className="text-[8px] font-ibm-mono uppercase tracking-[0.15em]">Search</span>
          </button>

          <Link
            to="/loadout"
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              isActive("/loadout") ? "text-black" : "text-gray-400"
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} strokeWidth={isActive("/loadout") ? 2.5 : 1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[8px] font-ibm-mono w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[8px] font-ibm-mono uppercase tracking-[0.15em]">Cart</span>
          </Link>

          <button
            onClick={() => setTrackOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-400 transition-colors active:text-black"
          >
            <MapPin size={20} strokeWidth={1.5} />
            <span className="text-[8px] font-ibm-mono uppercase tracking-[0.15em]">Track</span>
          </button>
        </div>

        {/* safe area for iPhone home indicator */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />
    </>
  );
}
