import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sections } from "@/lib/constants/protocol";

export default function Protocol() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar variant="dark" />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-20">
        <header className="mb-10 sm:mb-16">
          <p className="text-[8px] sm:text-[9px] text-gray-600 uppercase tracking-[0.22em] sm:tracking-[0.3em] mb-3 sm:mb-4">
            // classified_document
          </p>
          <h1
            className="text-base sm:text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-center sm:text-left"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            OPERATIONAL_PROTOCOL_001
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <span className="text-[8px] sm:text-[9px] text-gray-600 tracking-[0.22em] sm:tracking-[0.3em] uppercase">
              REVISION: 2026.03
            </span>
            <span className="text-[8px] sm:text-[9px] text-gray-600 tracking-[0.22em] sm:tracking-[0.3em]">
              |
            </span>
            <span className="text-[8px] sm:text-[9px] text-gray-600 tracking-[0.22em] sm:tracking-[0.3em] uppercase">
              STATUS: ACTIVE
            </span>
          </div>
        </header>

        <div className="space-y-8 sm:space-y-12">
          {sections.map((section) => (
            <section key={section.id} className="border-l-[2px] border-white/10 pl-4 sm:pl-6">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] text-gray-600 tabular-nums tracking-[0.22em] sm:tracking-[0.3em]">
                  {section.id}
                </span>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                  {section.title}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-white/10">
          <p className="text-[8px] sm:text-[9px] text-gray-600 tracking-[0.22em] sm:tracking-[0.3em] uppercase">
            // end_of_document — METALLURG™ 2026
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
