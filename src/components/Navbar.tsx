import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { EncryptedText } from "@/components/ui/encrypted-text";
import type { NavbarProps } from "@/interfaces";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/stores/useCartStore";

export default function Navbar({ variant = "light" }: NavbarProps) {
  const bgColor = variant === "light" ? "bg-white" : "bg-black";
  const textColor = variant === "light" ? "text-black" : "text-white";
  const borderColor =
    variant === "light" ? "border-gray-200" : "border-gray-800";
  const hoverColor =
    variant === "light" ? "hover:text-gray-600" : "hover:text-gray-400";
  const logoEncrypted = variant === "light" ? "text-gray-400" : "text-gray-600";

  const cartItems = useCartStore((state) => state.items);
  return (
    <nav
      className={`sticky top-0 z-50 ${bgColor} border-b ${borderColor} w-full`}
    >
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.href}>
              <Button
                variant="link"
                className={`${textColor} ${hoverColor} p-0`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className={`absolute left-1/2 transform -translate-x-1/2 text-xl font-bold ${textColor}`}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName={logoEncrypted}
            revealedClassName={textColor}
            revealDelayMs={150}
          />
        </Link>

        <div className="flex items-center gap-6">
          <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
            search
            {/* // TODO add search workflow */}
          </Button>
          <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
            UAH / UA
            {/* // TODO add currency and language switcher components */}
          </Button>
          <Link to="/cart">
            <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
              <span className={`text-sm font-medium ${textColor}`}>
                cart ({cartItems.length}){" "}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
