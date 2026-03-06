import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";
import type { NavbarProps } from "@/interfaces";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/stores/useCartStore";
import { getThemeColors, type ThemeVariant } from "@/config/theme";

export default function Navbar({ variant = "light" }: NavbarProps) {
  const theme = getThemeColors(variant as ThemeVariant);
  const cartItems = useCartStore((state) => state.items);

  return (
    <nav
      className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border} w-full`}
    >
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.href}>
              <Button
                variant="link"
                className={`${theme.text} ${theme.hover} p-0`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className={`absolute left-1/2 transform -translate-x-1/2 text-xl font-bold ${theme.text}`}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName={theme.logoEncrypted}
            revealedClassName={theme.text}
            revealDelayMs={150}
          />
        </Link>

        <div className="flex items-center gap-6">
          <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
            search
          </Button>
          <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
            UAH / UA
          </Button>
          <Link to="/cart">
            <Button variant="link" className={`${theme.text} ${theme.hover} p-0`}>
              <span className={`text-sm font-medium ${theme.text}`}>
                cart ({cartItems.length})
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
