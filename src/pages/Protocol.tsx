import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "01",
    title: "STATUS_OF_DOMAIN",
    content:
      "This digital environment functions strictly as a Digital Archive and Interactive Inventory. All visual and textual content is for informational and archival purposes only. This domain does not operate as a commercial payment gateway and does not process automated financial transactions.",
  },
  {
    id: "02",
    title: "ACQUISITION_LOGIC",
    content:
      'The transfer of any objects listed within the inventory is handled exclusively through encrypted communication channels (Telegram: @metallurg_tm). An "Acquisition" is considered finalized only after direct verification by the Operator. We reserve the right to deny access to the inventory to any individual without prior notice.',
  },
  {
    id: "03",
    title: "AUTHENTICITY_&_CONDITION",
    content:
      'Every object undergoes a multi-stage [ AUTHENTICITY_VERIFICATION ] protocol before being indexed. As objects are sourced from private archives or limited releases, they are provided in "as-is" condition. Once a seal is broken or an object is dispatched, it is considered "In Operation" and is not eligible for return unless a separate private agreement is established.',
  },
  {
    id: "04",
    title: "LOGISTICS_&_RISK_MANAGEMENT",
    content:
      "International Dispatch: Objects are moved via independent logistics partners.\n\nJurisdiction: Local regulations of the destination country apply.\n\nLiability: The Archive is not responsible for delays or seizures resulting from international border control protocols or customs interference.",
  },
  {
    id: "05",
    title: "DATA_ENCRYPTION",
    content:
      "We do not store banking or sensitive financial data. All resident communication is confidential. For high-level inquiries and official documentation, the use of ProtonMail is mandatory.",
  },
];

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
