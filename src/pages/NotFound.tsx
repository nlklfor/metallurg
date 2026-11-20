import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import Wordmark from "@/components/brand/Wordmark";
import { NODES } from "@/lib/constants/navigation";
import { EASE_MTL } from "@/lib/motion";
import Seo from "@/components/seo/Seo";

// 404 (design file: E404-D / E404-M). The hero is the owner's Blender render:
// chrome "404" with a molten crack, transparent background.
//   - WebM (VP9 + alpha) for Chrome / Edge / Firefox
//   - animated WebP for Safari (no WebM alpha there)
//   - still WebP as poster and for "reduce motion"

const SRC = {
  webm: "/404/metallurg_404.webm",
  animated: "/404/metallurg_404_animated.webp",
  still: "/404/metallurg_404_still.webp",
};

function pickMedia(): "video" | "animated" | "still" {
  if (typeof window === "undefined") return "still";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "still";
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(ua);
  return isSafari ? "animated" : "video";
}

function Hero() {
  const [media] = useState(pickMedia);
  const cls = "h-full w-full object-contain";
  return (
    <div className="aspect-video w-full scale-[1.3] sm:scale-110 lg:scale-100">
      {media === "video" ? (
        <video
          className={cls}
          autoPlay
          loop
          muted
          playsInline
          poster={SRC.still}
          aria-label="404 — page not found"
        >
          <source src={SRC.webm} type="video/webm" />
        </video>
      ) : (
        <img
          className={cls}
          src={media === "animated" ? SRC.animated : SRC.still}
          alt="404 — page not found"
        />
      )}
    </div>
  );
}

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-ink px-4 pb-7 font-mono text-paper sm:px-8 lg:px-12 lg:pb-10"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
      }}
    >
      <Seo
        title="Not found — METALLURG™"
        description="This page is not in the archive."
        index={false}
      />

      {/* top bar */}
      <header className="flex h-14 items-center justify-center border-b border-[#1F2937] text-[11px] tracking-[0.15em] text-gray-400 lg:h-16 lg:justify-between">
        <span className="hidden lg:block">ERR_404</span>
        <Link to="/" className="text-[18px] !text-paper lg:text-[24px]" aria-label="METALLURG home">
          <Wordmark encryptedClassName="text-neutral-500" />
        </Link>
        <span className="hidden lg:block">{NODES.ua.coords}</span>
      </header>

      <main className="grid flex-1 grid-cols-1 content-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_MTL }}
        >
          <h1 className="sr-only">404 — page not found</h1>
          <Hero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_MTL }}
          className="flex flex-col gap-3 lg:gap-[18px]"
        >
          <span className="text-[12px] tracking-[0.25em] lg:text-[13px] lg:tracking-[0.3em]">
            // SYSTEM_ERROR
          </span>
          <p className="text-[13px] leading-[1.7] text-[#D1D5DB] lg:text-[15px]">
            Sector not found. The object may have been archived, or the link was corrupted in
            transit.
          </p>
          <p className="break-all text-[10px] leading-[2] tracking-[0.1em] text-gray-500 lg:text-[11px]">
            // PATH: {pathname}
            <br />
            // TRACE: ARCHIVE ✓ / OBJECT ░
          </p>
          <div className="mt-6 flex flex-col gap-2 lg:mt-3 lg:gap-4">
            <Link
              to="/inventory"
              className="flex h-14 items-center justify-center bg-paper text-[12px] font-bold tracking-[0.15em] !text-ink transition-colors hover:bg-gray-200 lg:h-[60px] lg:text-[13px]"
            >
              RETURN_TO_INVENTORY →
            </Link>
            <Link
              to="/"
              className="flex h-12 items-center justify-center text-[11px] tracking-[0.15em] !text-gray-400 hover:!text-paper lg:h-auto lg:justify-start lg:text-[12px]"
            >
              [ HOME ]
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
