import { EncryptedText } from "@/components/ui/encrypted-text";
import "@google/model-viewer";
import mtlLogoGlb from "@/assets/icons/logo-mtl.glb?url";

export default function WelcomeGate() {
  return (
    <div className="gate-root">
      <div className="gate-scanlines" />
      <div className="gate-grain" />

      {/* 3D Model */}
      <div className="gate-monolith">
        <model-viewer
          src={mtlLogoGlb}
          auto-rotate
          disable-zoom
          camera-controls="false"
          environment-image="neutral"
          rotation-per-second="24deg"
          shadow-intensity="0"
          exposure="1.2"
          camera-orbit="0deg 45deg auto"
          field-of-view="30deg"
          alt="MTL Logo"
          style={{
            width: "100%",
            height: "50vh",
            background: "transparent",
            outline: "none",
          }}
        />
      </div>

      {/* SOON title + encrypted logo */}
      <div className="gate-title-block">
        <h1
          className="gate-title-soon"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
        >
          SOON
        </h1>
        <h2
          className="text-3l tracking-tighter text-white drop-shadow-2xl text-center"
          style={{ fontFamily: "'TheNeue', sans-serif", fontWeight: 900 }}
        >
          <EncryptedText
            text="METALLURG™"
            encryptedClassName="text-neutral-500"
            revealedClassName="dark:text-white text-white"
            revealDelayMs={200}
          />
        </h2>
      </div>

      {/* Coordinates watermark */}
      <div className="gate-coords">
        <p>47.3769° N, 8.5417° E — ZÜRICH</p>
        <p>50.4501° N, 30.5234° E — KYIV</p>
      </div>
    </div>
  );
}
