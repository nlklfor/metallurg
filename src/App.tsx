import { TypingAnimation } from "@/components/ui/typing-animation";
import { EncryptedText } from "./components/ui/encrypted-text";
import Aurora from "./components/ui/Aurora";
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#ffffff", "#919191", "#444444"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      {/* Spotify Playlist - Top Right */}
      <div className="fixed top-8 right-8 z-40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/playlist/2g4MwiVghEPSOBAnUAGxPH?utm_source=generator"
          width="340"
          height="80"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>

      {/* Main Content - Center */}
      <div className="relative z-20 flex h-screen flex-col items-center justify-center gap-8">
        <h1 className="text-8xl font-bold text-white drop-shadow-2xl text-center">
          <EncryptedText
            text="METALLURG™"
            encryptedClassName="text-neutral-500"
            revealedClassName="dark:text-white text-white"
            revealDelayMs={150}
          />
        </h1>

        {/* Navigation Buttons - Vertical Stack */}
        <nav className="flex flex-col gap-4 mt-10 items-center">
          <Link to="/shop" className="w-40">
            <Button size="lg" className="text-white w-full">
              Shop
            </Button>
          </Link>
          <div className="w-40">
            <Button size="lg" className="text-white w-full">
              Contact
            </Button>
          </div>
          <div className="w-40">
            <Button size="lg" className="text-white w-full">
              News
            </Button>
          </div>
          <div className="w-40">
            <Button size="lg" className="text-white w-full">
              Orders & Reviews
            </Button>
          </div>
        </nav>
      </div>

      {/* Text Animation - Bottom Left */}
      <div className="fixed bottom-12 left-8 z-20 flex flex-col">
        <div className="text-white text-md h-8">
          <TypingAnimation>INITIALIZING METALLURG...</TypingAnimation>
        </div>
        <div className="text-white text-md h-8">
          <TypingAnimation delay={3000}>
            FORGING NEW-AGE STREETWEAR.
          </TypingAnimation>
        </div>
        <div className="text-white text-md h-8">
          <TypingAnimation delay={6000}>
            NO IMPURITIES. ONLY HEAT.
          </TypingAnimation>
        </div>
      </div>
    </div>
  );
}

export default App;
