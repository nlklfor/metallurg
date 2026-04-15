import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";
import type { NavbarProps } from "@/interfaces";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { getThemeColors, type ThemeVariant } from "@/config/theme";
import { useState, useRef, useEffect } from "react";
import SearchModal from "@/components/SearchModal";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@/stores/useCurrencyStore";

export default function Navbar({ variant = "light" }: NavbarProps) {
  const theme = getThemeColors(variant as ThemeVariant);
  const cartItems = useCartStore((state) => state.items);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  const currencyKeys: CurrencyCode[] = ["UAH", "CHF", "EUR"];

  useEffect(() => {
    if (!currencyOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [currencyOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const cartCount = cartItems.reduce((total, item) => total + item.cart_quantity, 0);

  return (
    <>
      <nav className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border} w-full`}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4">
          {/* Desktop nav links */}
          <div className="hidden md:flex gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.href}>
                <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile burger + search */}
          <div className="md:hidden flex items-center gap-4">
            <button
              className={`flex flex-col justify-center gap-[5px] w-6 h-6 ${theme.text}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`block h-[1.5px] w-full bg-current transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-current transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-current transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
                }`}
              />
            </button>
            <button
              className={`${theme.text} ${theme.hover}`}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {/* Center logo */}
          <Link
            to="/"
            className={`absolute left-1/2 transform -translate-x-1/2 text-lg sm:text-xl font-bold ${theme.text}`}
            style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
          >
            <EncryptedText
              text="METALLURG™"
              encryptedClassName={theme.logoEncrypted}
              revealedClassName={theme.text}
              revealDelayMs={150}
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Button
              variant="link"
              className={`${theme.text} ${theme.hover} p-0 hidden md:inline-flex`}
              onClick={() => setSearchOpen(true)}
            >
              search
            </Button>
            <div ref={currencyRef} className="relative hidden sm:block">
              <Button
                variant="link"
                className={`${theme.text} ${theme.hover} p-0`}
                onClick={() => setCurrencyOpen((o) => !o)}
              >
                {CURRENCIES[currency].label}
              </Button>
              {currencyOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 border ${theme.border} ${theme.bg} z-50 min-w-[140px]`}
                >
                  {currencyKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrency(key);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                        currency === key
                          ? `${theme.text} font-bold`
                          : `${theme.textSecondary} hover:${theme.text}`
                      }`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {CURRENCIES[key].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link to="/loadout">
              <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
                <span className={`text-xs sm:text-sm font-medium ${theme.text}`}>
                  loadout ({cartCount})
                </span>
              </Button>
            </Link>
          </div>
        </div>

        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className={`fixed inset-0 z-[60] ${theme.bg} flex flex-col md:hidden`}>
          {/* Close button */}
          <div className={`flex items-center justify-between px-4 py-4 border-b ${theme.border}`}>
            <span
              className={`text-lg font-bold ${theme.text}`}
              style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
            >
              METALLURG™
            </span>
            <button
              className={`w-6 h-6 ${theme.text}`}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1 px-4 pt-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 text-sm uppercase tracking-[0.2em] font-medium ${theme.text} border-b ${theme.border}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Currency selector in mobile menu */}
          <div className="px-4 pt-6">
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-3 ${theme.textSecondary}`}>
              Currency
            </p>
            <div className="flex gap-3">
              {currencyKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrency(key);
                  }}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                    currency === key
                      ? `${theme.text} font-bold ${theme.border}`
                      : `${theme.textSecondary} ${theme.border}`
                  }`}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {CURRENCIES[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
