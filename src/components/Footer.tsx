import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { Button } from "./ui/button";
import { FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-start gap-16">
        <div className="flex-shrink-0 mt-8">
          <Link to="/" className="text-2xl font-bold text-white">
            <EncryptedText
              text="METALLURG™"
              encryptedClassName="text-gray-600"
              revealedClassName="text-white"
              revealDelayMs={150}
            />
          </Link>
        </div>

        <div className="flex gap-20">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white mb-2">FAQ</h3>
            {FOOTER_LINKS.faq.map((link) => (
              <Button
                key={link.label}
                variant="link"
                className="text-gray-400 hover:text-white transition p-0 h-auto justify-start font-normal text-sm"
              >
                {link.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white mb-2">Shop</h3>
            {FOOTER_LINKS.shop.map((link) => (
              <Link key={link.label} to={link.href}>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white transition p-0 h-auto justify-start font-normal text-sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white mb-2">Legal</h3>
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.label} to={link.href}>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white transition p-0 h-auto justify-start font-normal text-sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8">
        <p className="text-sm text-gray-500">{SITE_CONFIG.copyright}</p>
      </div>
    </footer>
  );
}
