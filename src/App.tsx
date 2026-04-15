import { TypingAnimation } from "@/components/ui/typing-animation";
import { EncryptedText } from "./components/ui/encrypted-text";
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";
import { MAIN_PAGE_BTNS } from "@/lib/constants/navigation";
import subwayVideo from "@/assets/videos/subway.mp4";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover"
      >
        <source src={subwayVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/50" />

      <div className="relative z-20 flex h-screen flex-col items-center justify-center gap-4 sm:gap-8 px-4">
        <h1
          className="text-2xl sm:text-4xl md:text-5xl tracking-tighter text-white drop-shadow-2xl text-center"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName="text-neutral-500"
            revealedClassName="dark:text-white text-white"
            revealDelayMs={150}
          />
        </h1>
        <nav className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-10 items-center">
          {MAIN_PAGE_BTNS.map((btn) => (
            <Link key={btn.label} to={btn.href} className="w-40">
              <Button size="lg" variant={"link"} className="text-white w-full">
                {btn.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="fixed bottom-6 sm:bottom-12 left-4 sm:left-8 z-20 flex flex-col">
        <div className="text-white text-[10px] sm:text-xs h-5">
          <TypingAnimation>// ACCESSING_ARCHIVE_2026... </TypingAnimation>
          <TypingAnimation delay={2700} className="text-green-400 animate-pulse">
            OK
          </TypingAnimation>
        </div>
        <div className="text-white text-[10px] sm:text-xs h-5">
          <TypingAnimation delay={3000}>// STATUS: OPERATIONAL</TypingAnimation>
        </div>
        <div className="text-white text-[10px] sm:text-xs h-5">
          <TypingAnimation delay={6000}>// WELCOME TO MTL_NETWORK</TypingAnimation>
        </div>
      </div>

      <div className="fixed top-4 right-4 sm:bottom-12 sm:top-auto sm:right-8 z-20 text-white/30 text-[7px] sm:text-[8px] font-mono tracking-[0.2em] uppercase text-right space-y-0.5">
        <p>50.4501° N, 30.5234° E</p>
        <p>KYIV, UKRAINE</p>
      </div>
    </div>
    // TODO ADD COOKIES AND PRIVACY POLICY LINKS IN THE FOOTER
  );
}

export default App;
