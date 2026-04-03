import { Link } from "react-router-dom";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function NotFound() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center relative">
      {/* Scanlines */}
      <div className="gate-scanlines" />
      <div className="gate-grain" />

      {/* Glitch 404 */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        <p
          className="text-[10px] text-white/20 tracking-[0.5em] uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          // SYSTEM_ERROR
        </p>

        <h1
          className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-white select-none notfound-glitch"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
          data-text="404"
        >
          404
        </h1>

        <div className="flex flex-col items-center gap-2 -mt-4">
          <div
            className="text-sm text-white/60 h-6"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <TypingAnimation duration={50} showCursor cursorStyle="block">
              {"> ROUTE_NOT_FOUND — ACCESS_DENIED"}
            </TypingAnimation>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            to="/"
            className="border border-white/30 px-10 py-4 text-xs uppercase tracking-[0.3em] !text-white no-underline hover:bg-white hover:!text-black transition-all duration-200"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            [ RETURN_TO_BASE ]
          </Link>
        </div>
      </div>

      {/* Bottom logo */}
      <div className="absolute bottom-10 z-20">
        <span
          className="text-lg tracking-tighter"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName="text-neutral-700"
            revealedClassName="text-white/15"
            revealDelayMs={150}
          />
        </span>
      </div>

      {/* Coords */}
      <div className="gate-coords">
        <p>ERR::404</p>
        <p>PATH_UNDEFINED</p>
      </div>
    </div>
  );
}
