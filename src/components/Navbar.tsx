import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Globe, ShoppingCart } from "lucide-react";
import { EncryptedText } from "@/components/ui/encrypted-text";

interface NavbarProps {
  variant?: "light" | "dark";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const bgColor = variant === "light" ? "bg-white" : "bg-black";
  const textColor = variant === "light" ? "text-black" : "text-white";
  const borderColor = variant === "light" ? "border-gray-200" : "border-gray-800";
  const hoverColor = variant === "light" ? "hover:text-gray-600" : "hover:text-gray-400";
  const hoverBg = variant === "light" ? "hover:bg-gray-100" : "hover:bg-gray-900";
  const logoEncrypted = variant === "light" ? "text-gray-400" : "text-gray-600";

  return (
    <nav className={`sticky top-0 z-50 ${bgColor} border-b ${borderColor} w-full`}>
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex gap-6">
          <Link to="/">
            <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
              Home
            </Button>
          </Link>
          <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
            Orders & Reviews
          </Button>
          <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
            Contact
          </Button>
          <Button variant="link" className={`${textColor} ${hoverColor} p-0`}>
            News
          </Button>
        </div>

        <Link to="/" className={`absolute left-1/2 transform -translate-x-1/2 text-xl font-bold ${textColor}`}>
          <EncryptedText
            text="METALLURG™"
            encryptedClassName={logoEncrypted}
            revealedClassName={textColor}
            revealDelayMs={150}
          />
        </Link>

        <div className="flex items-center gap-6">
          <button className={`p-2 ${hoverBg} rounded-md transition`}>
            <Search size={20} className={textColor} />
          </button>
          <button className={`p-2 ${hoverBg} rounded-md transition`}>
            <Globe size={20} className={textColor} />
          </button>
          <button className={`flex items-center gap-2 p-2 ${hoverBg} rounded-md transition`}>
            <ShoppingCart size={20} className={textColor} />
            <span className={`text-sm font-medium ${textColor}`}>(0)</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
