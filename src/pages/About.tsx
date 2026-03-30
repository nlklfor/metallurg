import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PILLARS, TIMELINE, VALUES } from "@/lib/constants/about";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function About() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />

      <div className="px-8 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </div>
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-3">
              // ABOUT_METALLURG
            </p>
            <h2 className="text-6xl font-black text-black uppercase tracking-tighter italic">
              About
            </h2>
          </div>
          <p className="text-[10px] text-gray-300 tracking-[0.3em] uppercase hidden md:block">
            METALLURG™ — EST. 2024
          </p>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            A curated archive of heavy luxury and rare streetwear. Not a store — an inventory.
            Documentation, provenance, and access to pieces that don't exist in the public domain.
          </p>
        </div>
      </div>

      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-4">
                // MANIFESTO
              </p>
              <div className="border-l-2 border-black pl-6 space-y-4">
                <div>
                  <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase">
                    50.4501° N, 30.5234° E
                  </p>
                  <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase">
                    KYIV, UKRAINE
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase">
                    TYPE: CURATED_INVENTORY
                  </p>
                  <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase">
                    SECTOR: LUXURY / STREETWEAR
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-black text-black uppercase tracking-tight leading-tight"
              >
                This is not a store.
                <br />
                This is an <span className="italic text-gray-400">archive</span> — we document,
                verify, and catalogue what others let disappear.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-sm text-gray-400 leading-relaxed max-w-xl"
              >
                METALLURG™ exists at the intersection of private collecting and public
                documentation. We maintain an inventory of pieces that don't appear on shelves —
                archived collections, limited collaborations, and one-of-one grails preserved
                through trusted networks. The archive is the product.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-8">
        <div className="max-w-5xl mx-auto border-t border-gray-200" />
      </div>

      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-10">
            // HOW_WE_OPERATE
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border border-gray-200 p-8 hover:border-black transition-all group -ml-px -mt-px first:ml-0 first:mt-0"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[9px] text-gray-300 tracking-[0.2em]">0{i + 1}</span>
                  <div className="flex-1 h-px bg-gray-200 group-hover:bg-black transition-colors" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.15em] text-black mb-4">
                  {pillar.title}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-8">
        <div className="max-w-5xl mx-auto border-t border-gray-200" />
      </div>

      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-10">
            // CORE_SPECS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border border-gray-200 p-6 hover:border-black transition-all group"
              >
                <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase mb-4">
                  // {item.label}
                </p>
                <p className="text-4xl font-black text-black italic tracking-tight mb-3 group-hover:scale-105 transition-transform origin-left">
                  {item.value}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-8">
        <div className="max-w-5xl mx-auto border-t border-gray-200" />
      </div>

      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-10">// TIMELINE</p>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="grid grid-cols-12 gap-6 border-t border-gray-200 py-10 group"
              >
                <div className="col-span-2">
                  <p className="text-3xl font-black text-gray-200 italic tracking-tight group-hover:text-black transition-colors">
                    {item.year}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-black">
                    {item.title}
                  </p>
                </div>
                <div className="col-span-7">
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
            <div className="grid grid-cols-12 gap-6 border-t border-gray-200 py-10">
              <div className="col-span-2">
                <p className="text-3xl font-black text-gray-200 italic tracking-tight">????</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-300">
                  NEXT_CHAPTER
                </p>
              </div>
              <div className="col-span-7">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm text-gray-300 leading-relaxed">Sourcing in progress...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-8">
        <div className="max-w-5xl mx-auto border-t border-gray-200" />
      </div>

      <section className="px-8 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[8px] text-gray-300 tracking-[0.5em] uppercase mb-6">
              // PHILOSOPHY
            </p>
            <blockquote className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter italic leading-tight max-w-3xl mx-auto">
              "If it's still on
              <br />
              the shelf — it doesn't belong{" "}
              <span className="text-gray-300 hover:text-black transition-colors duration-500">
                to the archive
              </span>
              ."
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-gray-300" />
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase">METALLURG™</p>
              <div className="w-8 h-px bg-gray-300" />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
