import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import type { NavbarProps } from "@/interfaces";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@/stores/useCurrencyStore";
import SearchModal from "@/components/search/SearchModal";
import Wordmark from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { DURATION, EASE_MTL } from "@/lib/motion";

const CURRENCY_KEYS: CurrencyCode[] = ["UAH", "CHF", "EUR"];

// Two themes, one structure. ARCHIVE pages (inventory, loadout, orders,
// contact, about) are light; OBJECT pages (product, protocol) are dark.
const THEMES = {
  light: {
    bar: "bg-paper text-ink border-rule",
    dim: "text-dim",
    hoverText: "hover:text-ink",
    pill: "bg-ink text-paper",
    menu: "bg-paper text-ink",
    rule: "border-rule",
    scramble: "text-dim-dark",
  },
  dark: {
    bar: "bg-ink text-paper border-rule-dark",
    dim: "text-dim-dark",
    hoverText: "hover:text-paper",
    pill: "bg-paper text-ink",
    menu: "bg-ink text-paper",
    rule: "border-rule-dark",
    scramble: "text-dim",
  },
} as const;

function SearchIcon() {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const t = THEMES[variant];
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.cart_quantity, 0));
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currencyOpen) return;
    const onClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCurrencyOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [currencyOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const currencyMenu = (
    <div ref={currencyRef} className="relative">
      <button
        type="button"
        onClick={() => setCurrencyOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={currencyOpen}
        className={cn("h-11 px-1 tracking-[0.15em] transition-colors", t.hoverText)}
      >
        {currency} <span aria-hidden="true">▾</span>
      </button>
      {currencyOpen && (
        <ul
          role="listbox"
          aria-label="Currency"
          className={cn("absolute right-0 top-full z-50 min-w-[140px] border", t.bar)}
        >
          {CURRENCY_KEYS.map((key) => (
            <li key={key}>
              <button
                type="button"
                role="option"
                aria-selected={currency === key}
                onClick={() => {
                  setCurrency(key);
                  setCurrencyOpen(false);
                }}
                className={cn(
                  "h-11 w-full px-4 text-left text-[11px] tracking-[0.2em] transition-colors",
                  currency === key ? "font-bold" : cn(t.dim, t.hoverText)
                )}
              >
                {CURRENCIES[key].label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <nav
        aria-label="Main"
        className={cn("sticky top-0 z-50 w-full border-b font-mono text-[11px] uppercase", t.bar)}
      >
        {/* Desktop — 64px, links · wordmark · controls */}
        <div className="hidden h-bar grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-6 md:grid">
          <div className="flex gap-6 tracking-[0.15em]">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "border-b pb-0.5 transition-colors",
                    isActive ? "border-current" : cn("border-transparent", t.dim, t.hoverText)
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link to="/" aria-label="METALLURG™ — home" className="text-[22px]">
            <Wordmark encryptedClassName={t.scramble} />
          </Link>

          <div className="flex items-center justify-end gap-5 tracking-[0.15em]">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn(
                "flex h-11 w-11 items-center justify-center transition-colors",
                t.hoverText
              )}
            >
              <SearchIcon />
            </button>
            {currencyMenu}
            <Link to="/loadout" className={cn("px-2.5 py-1.5", t.pill)}>
              LOADOUT [ {cartCount} ]
            </Link>
          </div>
        </div>

        {/* Mobile — 56px top bar: [ MENU ] · wordmark · currency */}
        <div className="grid h-topbar grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="h-11 justify-self-start tracking-[0.15em]"
          >
            [ MENU ]
          </button>
          <Link to="/" aria-label="METALLURG™ — home" className="text-lg">
            <Wordmark encryptedClassName={t.scramble} />
          </Link>
          <div className="justify-self-end">{currencyMenu}</div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.hover, ease: EASE_MTL }}
            className={cn(
              "fixed inset-0 z-[60] flex flex-col font-mono uppercase md:hidden",
              t.menu
            )}
          >
            <div
              className={cn(
                "grid h-topbar grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b px-4 text-[11px]",
                t.rule
              )}
            >
              <span className={cn("eyebrow", t.dim)}>// MENU</span>
              <Wordmark animated={false} className="text-lg" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="h-11 justify-self-end tracking-[0.15em]"
              >
                [ CLOSE ]
              </button>
            </div>

            <ul className="flex flex-col px-4 pt-6">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.page, ease: EASE_MTL, delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "display flex h-16 items-center border-b text-3xl",
                        t.rule,
                        !isActive && t.dim
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto px-4 pb-10">
              <p className={cn("eyebrow mb-3", t.dim)}>// CURRENCY</p>
              <div className="flex gap-2">
                {CURRENCY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCurrency(key)}
                    aria-pressed={currency === key}
                    className={cn(
                      "h-11 flex-1 border text-[11px] tracking-[0.2em] transition-colors",
                      currency === key ? t.pill : t.rule
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
