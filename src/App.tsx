import { Link } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Wordmark from "@/components/brand/Wordmark";
import { MAIN_PAGE_BTNS, NODES } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import subwayVideo from "@/assets/videos/subway.mp4";
import Seo from "@/components/seo/Seo";

// Landing (design file: Landing-D / Landing-M). Subway loop under a 50%
// black overlay with faint scanlines; Kyiv node coordinates top-left;
// wordmark + four entries centred in the free space; boot log bottom-left.
// (The FEATURED_OBJECT card from the design is left out for now.)

function BootLog() {
  return (
    <div className="flex flex-col text-[10px] leading-[2] tracking-[0.08em] text-[#D1D5DB] lg:text-[11px] lg:leading-[2.1]">
      <div className="h-5">
        <TypingAnimation>// ACCESSING_ARCHIVE_2026... </TypingAnimation>
        <TypingAnimation delay={2700} className="text-status-ok">
          OK
        </TypingAnimation>
      </div>
      <div className="h-5">
        <TypingAnimation delay={3000}>// STATUS: OPERATIONAL</TypingAnimation>
      </div>
      <div className="h-5">
        <TypingAnimation delay={6000}>// WELCOME TO MTL_NETWORK</TypingAnimation>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-ink font-mono text-paper">
      <Seo />
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={subwayVideo} type="video/mp4" />
      </video>
      {/* 50% overlay + scanline grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-ink/50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative z-20 flex min-h-[100dvh] flex-col px-4 pb-6 pt-8 sm:px-8 lg:px-12 lg:py-8">
        {/* Node coordinates */}
        <div className="flex text-[10px] tracking-[0.15em] text-dim-dark">
          <div className="flex flex-col gap-1 lg:gap-1.5">
            <span className="text-paper">{NODES.ua.city}</span>
            <span>{NODES.ua.coords}</span>
          </div>
        </div>

        {/* Wordmark + entries */}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 lg:gap-5">
          <span className="eyebrow text-[10px] text-dim-dark">// ARCHIVE_2026</span>
          <h1 className="text-2xl leading-none sm:text-4xl md:text-5xl">
            <Wordmark encryptedClassName="text-neutral-500" />
          </h1>

          {/* phones: 2×2 grid, INVENTORY filled */}
          <nav
            aria-label="Main"
            className="mt-8 grid w-full max-w-[420px] grid-cols-2 border border-[#374151] sm:hidden"
          >
            {MAIN_PAGE_BTNS.map((btn, i) => (
              <Link
                key={btn.href}
                to={btn.href}
                className={cn(
                  "flex h-[52px] items-center justify-center text-[11px] tracking-[0.12em]",
                  i === 0 && "bg-paper !text-ink",
                  i % 2 === 1 && "border-l border-[#374151]",
                  i > 1 && "border-t border-[#374151]"
                )}
              >
                {btn.label}
              </Link>
            ))}
          </nav>

          {/* tablet + desktop: one row, INVENTORY underlined */}
          <nav
            aria-label="Main"
            className="mt-7 hidden gap-8 text-[12px] tracking-[0.15em] sm:flex lg:gap-12 lg:text-[13px]"
          >
            {MAIN_PAGE_BTNS.map((btn, i) => (
              <Link
                key={btn.href}
                to={btn.href}
                className={cn(
                  "border-b pb-1.5 transition-colors duration-200",
                  i === 0
                    ? "border-paper !text-paper"
                    : "border-transparent !text-[#D1D5DB] hover:border-paper hover:!text-paper"
                )}
              >
                {btn.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Boot log */}
        <div>
          <BootLog />
        </div>
      </div>
      {/* TODO: cookies + privacy policy links once the Privacy page exists */}
    </div>
  );
}

export default App;
