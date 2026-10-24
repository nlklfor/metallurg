import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import SearchModal from "@/components/search/SearchModal";
import { cn } from "@/lib/utils";

// Mobile-only bar with the four routes a QR / Instagram visitor actually
// needs. Active tab inverts. 64px + iPhone safe area.

const VISIBLE_ROUTES = ["/inventory", "/contact", "/about", "/orders", "/loadout"];

const icon = {
  inventory: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  loadout: <path d="M4 8h16v12H4zM8 8V4h8v4" />,
  orders: <path d="M5 6h14M5 12h14M5 18h9" />,
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const tab =
  "flex flex-col items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.15em] transition-colors duration-150";

export default function BottomBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.cart_quantity, 0));

  const visible = VISIBLE_ROUTES.includes(pathname) || pathname.startsWith("/product/");
  if (!visible) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(tab, isActive ? "bg-ink text-paper" : "text-ink");

  return (
    <>
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper font-mono md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid h-bar grid-cols-4">
          <NavLink to="/inventory" className={linkClass}>
            <Icon>{icon.inventory}</Icon>
            INVENTORY
          </NavLink>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(tab, "text-ink active:bg-ink active:text-paper")}
          >
            <Icon>{icon.search}</Icon>
            SEARCH
          </button>
          <NavLink to="/loadout" className={linkClass}>
            <Icon>{icon.loadout}</Icon>
            LOADOUT [{cartCount}]
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            <Icon>{icon.orders}</Icon>
            ORDERS
          </NavLink>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
