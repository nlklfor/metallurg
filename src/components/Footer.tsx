import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500">
          © 2026 METALLURG™ — ALL RIGHTS RESERVED
        </span>

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
