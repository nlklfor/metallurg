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

  return (
    <nav className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border} w-full`}>
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.href}>
              <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
        {/* TODO ADD LANGUAGE SWITCHER AND CURRENCY SELECTOR */}
        <Link
          to="/"
          className={`absolute left-1/2 transform -translate-x-1/2 text-xl font-bold ${theme.text}`}
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName={theme.logoEncrypted}
            revealedClassName={theme.text}
            revealDelayMs={150}
          />
        </Link>

        <div className="flex items-center gap-6">
          <Button
            variant="link"
            className={`${theme.text} ${theme.hover} p-0`}
            onClick={() => setSearchOpen(true)}
          >
            search
          </Button>
          <div ref={currencyRef} className="relative">
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
              <span className={`text-sm font-medium ${theme.text}`}>
                loadout ({cartItems.reduce((total, item) => total + item.cart_quantity, 0)})
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
