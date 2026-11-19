import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sections } from "@/lib/constants/protocol";
import Seo from "@/components/seo/Seo";

// Protocol — original text and dark colours, new layout (design file: Protocol-D / Protocol-M):
// contents + document meta on the left (sticky), numbered sections on the
// right; on phones a JUMP_TO row instead of the contents list.

const META = [
  ["REVISION", "2026.03"],
  ["STATUS", "ACTIVE"],
] as const;

const jump = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(`protocol-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** "OPERATIONAL_PROTOCOL_001" → may break after "_" instead of mid-word. */
function Breakable({ text }: { text: string }) {
  const parts = text.split("_");
  return (
    <>
      {parts.map((part, j) => (
        <span key={j}>
          {part}
          {j < parts.length - 1 && (
            <>
              _<wbr />
            </>
          )}
        </span>
      ))}
    </>
  );
}

export default function Protocol() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ink font-mono text-paper">
      <Seo />
      <Navbar variant="dark" />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs variant="dark" items={[{ label: "Home", href: "/" }, { label: "Protocol" }]} />
      </div>

      <div className="grid grid-cols-1 gap-8 px-4 pb-16 pt-6 sm:px-8 md:px-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 lg:pb-24 lg:pt-10">
        {/* ─── Contents + meta (desktop) ─── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px] flex flex-col gap-3.5">
            <span className="eyebrow text-[10px] text-gray-500">// CONTENTS</span>
            <nav aria-label="Contents" className="flex flex-col">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#protocol-${s.id}`}
                  onClick={jump(s.id)}
                  className="flex gap-3 border-b border-white/10 py-2.5 text-[11px] tracking-[0.12em] text-gray-300 transition-colors hover:border-white/40 hover:text-paper"
                >
                  <span className="text-gray-600">{s.id}</span>
                  <span className="break-words">{s.title}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-1.5 border border-white/20 p-3.5 text-gray-400 text-[10px] leading-[1.7] tracking-[0.1em]">
              <span className="eyebrow text-[10px] text-gray-500">// DOC_META</span>
              {META.map(([k, v]) => (
                <span key={k}>
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Document ─── */}
        <article className="flex max-w-[820px] flex-col gap-8 lg:gap-10">
          <header className="flex flex-col gap-3 lg:gap-4">
            <span className="eyebrow text-[10px] text-gray-500">// CLASSIFIED_DOCUMENT</span>
            <h1 className="display text-[28px] leading-[0.95] sm:text-[40px] lg:text-[56px]">
              <Breakable text="OPERATIONAL_PROTOCOL_001" />
            </h1>
            <div className="h-px bg-white/20" />
          </header>

          {/* phones: meta + jump row */}
          <div className="flex flex-col gap-4 lg:hidden">
            <div className="flex flex-col gap-1 border border-white/20 p-3 text-[10px] text-gray-400 leading-[1.7] tracking-[0.1em]">
              {META.map(([k, v]) => (
                <span key={k}>
                  {k}: {v}
                </span>
              ))}
            </div>
            <nav
              aria-label="Jump to section"
              className="-mx-4 flex gap-1.5 overflow-x-auto px-4 text-[10px] tracking-[0.1em] sm:mx-0 sm:px-0"
            >
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#protocol-${s.id}`}
                  onClick={jump(s.id)}
                  className="flex h-9 flex-shrink-0 items-center border border-white/15 px-2.5 text-gray-300 hover:border-white/50"
                >
                  {s.id}
                </a>
              ))}
              <span className="flex h-9 flex-shrink-0 items-center px-1 text-gray-600">
                JUMP_TO
              </span>
            </nav>
          </div>

          {sections.map((s) => (
            <section
              key={s.id}
              id={`protocol-${s.id}`}
              className="grid scroll-mt-24 grid-cols-1 gap-2.5 border-t border-white/20 pt-5 lg:grid-cols-[64px_minmax(0,1fr)] lg:gap-6 lg:pt-6"
            >
              <span className="text-[22px] font-bold leading-none lg:text-[28px]">{s.id}</span>
              <div className="flex flex-col gap-2.5 lg:gap-3">
                <h2 className="break-words text-[12px] font-bold tracking-[0.1em] lg:text-[15px] lg:tracking-[0.12em]">
                  {s.title}
                </h2>
                <p className="whitespace-pre-line text-[13px] leading-[1.75] text-gray-400 lg:text-[14px] lg:leading-[1.8]">
                  {s.content}
                </p>
              </div>
            </section>
          ))}

          <p className="border-t border-white/10 pt-6 text-[10px] tracking-[0.15em] text-gray-600 lg:pt-8">
            // END_OF_DOCUMENT — METALLURG™ 2026
          </p>
        </article>
      </div>

      <Footer />
    </div>
  );
}
