import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-4 sm:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gray-500 text-center sm:text-left">
            © 2026 METALLURG™ — ALL RIGHTS RESERVED
          </span>
          <Link
            to="/protocol"
            className="text-[8px] sm:text-[9px] tracking-[0.18em] sm:tracking-[0.25em] uppercase !text-gray-600 hover:!text-white transition-colors no-underline text-center sm:text-left"
          >
            VIEW_PROTOCOL_001
          </Link>
        </div>

        <Link
          to="/"
          className="text-lg sm:text-xl font-bold text-white"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900, fontSize: undefined }}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName="text-gray-600"
            revealedClassName="text-white"
            revealDelayMs={150}
          />
        </Link>
      </div>
    </footer>
  );
}
