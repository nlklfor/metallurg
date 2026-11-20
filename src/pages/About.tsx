import { motion } from "motion/react";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { PILLARS, TIMELINE, VALUES } from "@/lib/constants/about";
import { EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";
import Seo from "@/components/seo/Seo";

// About — original content, new layout (design file: About-D / About-M):
// statement, black pillars band, specs grid, timeline, philosophy.

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, delay: i * 0.08, ease: EASE_MTL },
});

/** "FULL_TRANSPARENCY" → may break after "_" instead of mid-word. */
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

export default function About() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-mono text-ink">
      <Seo />
      <Navbar variant="light" />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </div>

      {/* ─── Header ─── */}
      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <div className="flex items-end justify-between gap-6">
          <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">About</h1>
          <span className="hidden pb-2 text-[11px] tracking-[0.15em] text-dim md:block">
            METALLURG™ — EST. 2024
          </span>
        </div>
        <div className="h-px bg-ink" />
        <p className="max-w-2xl text-[12px] leading-relaxed lg:text-[13px]">
          A curated inventory of streetwear and sportswear. Not a store — an access point. Sourced,
          verified, and delivered through trusted channels.
        </p>
      </header>

      {/* ─── Manifesto ─── */}
      <section
        className="grid grid-cols-1 gap-8 px-4 pb-12 pt-6 sm:px-8 md:px-12 lg:grid-cols-12 lg:gap-x-6 lg:pb-16 lg:pt-10"
        aria-label="Manifesto"
      >
        <div className="flex flex-col gap-4 lg:col-span-4">
          <span className="eyebrow text-[10px] text-dim">// MANIFESTO</span>
          <div className="flex flex-col gap-3 border-l-2 border-ink pl-4 text-[10px] tracking-[0.15em] text-dim lg:pl-6">
            <div className="flex flex-col gap-0.5">
              <span>50.4501° N, 30.5234° E</span>
              <span>KYIV, UKRAINE</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>TYPE: CURATED_INVENTORY</span>
              <span>SECTOR: STREETWEAR / SPORT</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 lg:col-span-8 lg:gap-6">
          <motion.p
            {...reveal()}
            className="display text-[26px] leading-[1.02] sm:text-[36px] lg:text-[48px]"
          >
            This is not a store.
            <br />
            This is an <span className="text-dim-dark">inventory</span> — we source, verify, and
            deliver what's worth wearing.
          </motion.p>
          <motion.p
            {...reveal(1)}
            className="max-w-xl text-[13px] leading-[1.75] text-[#374151] lg:text-[15px]"
          >
            METALLURG™ sources streetwear and sportswear — pieces that fit your rotation. Each item
            verified and shipped through trusted networks. The inventory is the product.
          </motion.p>
        </div>
      </section>

      {/* ─── How we operate ─── */}
      <section
        className="flex flex-col bg-ink px-4 py-8 text-paper sm:px-8 md:px-12 lg:gap-6 lg:py-14"
        aria-label="How we operate"
      >
        <span className="eyebrow mb-4 text-[10px] text-dim-dark lg:mb-0">// HOW_WE_OPERATE</span>
        <div className="grid grid-cols-1 border-t border-[#374151] lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              {...reveal(i)}
              className={cn(
                "flex flex-col gap-2.5 border-b border-[#374151] py-5 lg:gap-3.5 lg:border-b-0 lg:py-0 lg:pt-7",
                i === 0 && "lg:pr-7",
                i === 1 && "lg:border-x lg:px-7",
                i === 2 && "lg:pl-7"
              )}
            >
              <span className="text-[10px] text-dim-dark lg:text-[11px]">0{i + 1}</span>
              <span className="display text-[32px] lg:text-[30px] xl:text-[44px]">
                <Breakable text={p.title} />
              </span>
              <p className="text-[12px] leading-[1.7] text-[#D1D5DB] lg:text-[13px]">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Core specs ─── */}
      <section
        className="flex flex-col gap-3 px-4 pt-12 sm:px-8 md:px-12 lg:gap-4 lg:pt-16"
        aria-label="Core specs"
      >
        <span className="eyebrow text-[10px] text-dim">// CORE_SPECS</span>
        <div className="grid grid-cols-2 border-l border-t border-ink lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.label}
              {...reveal(i)}
              className="flex flex-col gap-1.5 border-b border-r border-ink px-4 py-5 lg:gap-2 lg:p-6"
            >
              <span className="eyebrow text-[10px] text-dim">{v.label}</span>
              <span className="display text-[32px] leading-none lg:text-[56px]">{v.value}</span>
              <span className="text-[11px] leading-relaxed text-dim lg:text-[12px]">
                {v.description}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="flex flex-col px-4 pt-12 sm:px-8 md:px-12 lg:pt-16" aria-label="Timeline">
        <span className="eyebrow mb-3 text-[10px] text-dim lg:mb-4">// TIMELINE</span>
        <ol className="border-t border-ink">
          {TIMELINE.map((t, i) => (
            <motion.li
              key={t.year}
              {...reveal(i)}
              className="group grid grid-cols-1 gap-2 border-b border-rule py-6 lg:grid-cols-12 lg:gap-6 lg:py-8"
            >
              <span className="text-[30px] font-bold leading-none text-dim transition-colors duration-300 group-hover:text-ink lg:col-span-2 lg:text-[40px]">
                {t.year}
              </span>
              <span className="text-[13px] font-semibold tracking-[0.12em] lg:col-span-3 lg:pt-2 lg:text-[14px]">
                {t.title}
              </span>
              <p className="text-[12px] leading-relaxed text-[#374151] lg:col-span-7 lg:pt-2 lg:text-[13px]">
                {t.description}
              </p>
            </motion.li>
          ))}
          <li className="grid grid-cols-1 gap-2 border-b border-rule py-6 lg:grid-cols-12 lg:gap-6 lg:py-8">
            <span className="text-[30px] font-bold leading-none text-dim-dark lg:col-span-2 lg:text-[40px]">
              ????
            </span>
            <span className="text-[13px] font-semibold tracking-[0.12em] text-dim lg:col-span-3 lg:pt-2 lg:text-[14px]">
              NEXT_CHAPTER
            </span>
            <span className="flex items-center gap-2 text-[12px] text-dim lg:col-span-7 lg:pt-2 lg:text-[13px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse bg-status-ok" />
              Sourcing in progress...
            </span>
          </li>
        </ol>
      </section>

      {/* ─── Philosophy ─── */}
      <section
        className="flex flex-col items-center gap-6 px-4 py-16 text-center sm:px-8 md:px-12 lg:py-24"
        aria-label="Philosophy"
      >
        <span className="eyebrow text-[10px] text-dim">// PHILOSOPHY</span>
        <motion.blockquote
          {...reveal()}
          className="display max-w-3xl text-[32px] leading-[1.02] sm:text-[44px] lg:text-[56px]"
        >
          "Good pieces.
          <br />
          Right people.{" "}
          <span className="text-dim-dark transition-colors duration-500 hover:text-ink">
            No noise.
          </span>
          "
        </motion.blockquote>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-dim-dark" />
          <span className="text-[10px] tracking-[0.15em] text-dim">METALLURG™</span>
          <span aria-hidden="true" className="h-px w-8 bg-dim-dark" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
