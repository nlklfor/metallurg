import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500">
            © 2026 METALLURG™ — ALL RIGHTS RESERVED
          </span>
          <Link
            to="/protocol"
            className="text-[9px] tracking-[0.25em] uppercase !text-gray-600 hover:!text-white transition-colors no-underline"
          >
            VIEW_PROTOCOL_001
          </Link>
        </div>

        <Link
          to="/"
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900, fontSize: "14px" }}
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
