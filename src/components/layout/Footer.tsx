import { Link } from "react-router-dom";
import Wordmark from "@/components/brand/Wordmark";
import { MAIN_PAGE_LINKS, NODES } from "@/lib/constants/navigation";

const ARCHIVE_LINKS = [
  { to: "/inventory", label: "INVENTORY" },
  { to: "/orders", label: "ORDERS & REVIEWS" },
  { to: "/contact", label: "CONTACT" },
  { to: "/about", label: "ABOUT" },
];

const DOC_LINKS = [{ to: "/protocol", label: "PROTOCOL" }];

const linkClass = "w-fit transition-colors hover:text-dim-dark";

export default function Footer() {
  return (
    // pb-28 on mobile keeps the content clear of the fixed bottom bar.
    <footer className="mt-auto bg-ink px-4 pt-10 pb-28 font-mono text-paper sm:px-8 md:px-12 md:pb-10">
      <div className="mx-auto flex max-w-[1344px] flex-col gap-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Link to="/" aria-label="METALLURG™ — home" className="text-4xl md:text-6xl">
            <Wordmark encryptedClassName="text-dim" />
          </Link>
          <div className="text-[10px] tracking-[0.15em] text-dim-dark md:text-right">
            <p>KYIV {NODES.ua.coords}</p>
            <p>ZÜRICH {NODES.ch.coords}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 text-[11px] leading-[2] tracking-[0.1em] sm:grid-cols-3">
          <nav aria-label="Channels" className="flex flex-col">
            <span className="eyebrow mb-2 text-[9px] text-dim-dark">// CHANNELS</span>
            {MAIN_PAGE_LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkClass}>
                {l.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Archive" className="flex flex-col">
            <span className="eyebrow mb-2 text-[9px] text-dim-dark">// ARCHIVE</span>
            {ARCHIVE_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Documents" className="flex flex-col">
            <span className="eyebrow mb-2 text-[9px] text-dim-dark">// DOCS</span>
            {DOC_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-rule-dark pt-4 text-[10px] tracking-[0.15em] text-dim-dark">
          © 2026 METALLURG™ // KYIV ↔ ZÜRICH
        </div>
      </div>
    </footer>
  );
}
