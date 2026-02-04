import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/ui/light-rays";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { EncryptedText } from "./components/ui/encrypted-text";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <LightRays
        count={15}
        blur={50}
        speed={20}
        length="100vh"
        color="rgba(134, 134, 134, 0.58)"
      />

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
      <div className="relative z-10 flex h-screen flex-col items-center justify-center gap-8">
          <h1 className="text-8xl font-bold text-white drop-shadow-2xl text-center">
            <EncryptedText
              text="Welcome to metallurg™"
              encryptedClassName="text-neutral-500"
              revealedClassName="dark:text-white text-white"
              revealDelayMs={100}
            />
          </h1>

        {/* Navigation Buttons - Vertical Stack */}
        <nav className="flex flex-col gap-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 w-full justify-center"
          >
            Shop
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 w-full justify-center"
          >
            News
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 w-full justify-center"
          >
            Contact
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 w-full justify-center"
          >
            Orders & Reviews
          </Button>
        </nav>
      </div>

      {/* Text Animation - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-20 flex flex-col">
        <div className="text-white text-sm">
          <TypingAnimation>
            INITIALIZING METALLURG...
          </TypingAnimation>
        </div>
        <div className="text-white text-sm">
          <TypingAnimation delay={3000}>
            FORGING NEW-AGE STREETWEAR.
          </TypingAnimation>
        </div>
        <div className="text-white text-sm">
          <TypingAnimation delay={6000}>
            NO IMPURITIES. ONLY HEAT.
          </TypingAnimation>
        </div>
      </div>
    </div>
  );
}

export default App;
