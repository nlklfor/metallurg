import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Globe } from "lucide-react";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function Shop() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Left - Navigation Links */}
          <div className="flex gap-6">
            <Link to="/">
              <Button variant="link" className="text-black hover:text-gray-600 p-0">
                Home
              </Button>
            </Link>
            <Button variant="link" className="text-black hover:text-gray-600 p-0">
              Shop
            </Button>
            <Button variant="link" className="text-black hover:text-gray-600 p-0">
              Contact
            </Button>
            <Button variant="link" className="text-black hover:text-gray-600 p-0">
              News
            </Button>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-black">
            <EncryptedText
              text="METALLURG™"
              encryptedClassName="text-gray-400"
              revealedClassName="text-black"
              revealDelayMs={150}
            />
          </Link>

          {/* Right - Search, Currency, Cart */}
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-md transition">
              <Search size={20} className="text-black" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition">
              <Globe size={20} className="text-black" />
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition">
              <span className="text-sm font-medium text-black">cart (0)</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Shop Header */}
      <div className="px-8 py-16">
        <h2 className="text-5xl font-bold text-black mb-4">Shop</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Discover our premium collection of streetwear and contemporary fashion. Carefully curated pieces designed for the modern individual.
        </p>
      </div>

      {/* Content Area */}
      <div className="px-8 pb-16">
        {/* Placeholder for filters and cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters will go here */}
          {/* Cards will go here */}
        </div>
      </div>
    </div>
  );
}

