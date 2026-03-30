import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sections } from "@/lib/constants/protocol";

export default function Protocol() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar variant="dark" />

      <div className="flex-1 max-w-3xl mx-auto w-full px-8 py-20">
        <header className="mb-16">
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mb-4">
            // classified_document
          </p>
          <h1
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            OPERATIONAL_PROTOCOL_001
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[9px] text-gray-600 tracking-[0.3em] uppercase">
              REVISION: 2026.03
            </span>
            <span className="text-[9px] text-gray-600 tracking-[0.3em]">|</span>
            <span className="text-[9px] text-gray-600 tracking-[0.3em] uppercase">
              STATUS: ACTIVE
            </span>
          </div>
        </header>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} className="border-l-[2px] border-white/10 pl-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[10px] text-gray-600 tabular-nums tracking-[0.3em]">
                  {section.id}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">{section.title}</h2>
              </div>
              <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-white/10">
          <p className="text-[9px] text-gray-600 tracking-[0.3em] uppercase">
            // end_of_document — METALLURG™ 2026
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
