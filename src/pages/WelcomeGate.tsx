import { EncryptedText } from "@/components/ui/encrypted-text";
import "@google/model-viewer";
import mtlLogoGlb from "@/assets/icons/logo-mtl.glb?url";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BOOT_LINES = [
  "[SYS] Initializing METALLURG_CORE v2.6.0...",
  "[SYS] Loading_textures ██████████ OK",
  "[NET] Encrypting_Swiss_Sector... DONE",
  "[NET] UA_Warehouse_Connected",
  "[DB]  Syncing_inventory_nodes...",
  "[SEC] Verifying_operator_clearance...",
  "[SYS] Archive_index_rebuilt (1,247 objects)",
  "[NET] CH_NODE_47.37N — ONLINE",
  "[NET] UA_NODE_50.45N — ONLINE",
  "[SYS] STATUS: DEPLOYING_METALLURG_PROTOCOL",
];

function useBootLog() {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const idx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idx.current < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[idx.current]]);
        idx.current++;
        setProgress(Math.round((idx.current / BOOT_LINES.length) * 100));
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return { lines, progress, done: progress === 100 };
}

export default function WelcomeGate() {
  const { lines, progress, done } = useBootLog();
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setSubmitted(true);

    setTimeout(() => {
      setExiting(true);
    }, 1500);

    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  return (
    <div className={`gate-root ${exiting ? "gate-root--exit" : ""}`}>
      <div className="gate-scanlines" />
      <div className="gate-grain" />

      <div className="gate-layout">
        {/* 3D Model — smaller */}
        <div className="gate-monolith gate-monolith--compact">
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
              height: "100%",
              background: "transparent",
              outline: "none",
            }}
          />
        </div>

        {/* Encrypted brand */}
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

        {/* Status + progress */}
        <div className="gate-status">
          <p className="gate-status-label">
            {done ? "SYSTEM_ONLINE" : "INITIALIZING_ARCHIVE_CORE"}
          </p>
          <div className="gate-progress-bar">
            <div className="gate-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="gate-progress-pct">{progress}%</p>
        </div>

        {/* Boot log */}
        <div className="gate-terminal" ref={terminalRef}>
          <div className="gate-terminal-inner">
            {lines.map((line, i) => (
              <p key={i} className="gate-terminal-line">
                {line}
              </p>
            ))}
            {!done && <span className="gate-cursor">█</span>}
          </div>
        </div>

        {/* Nickname capture */}
        <div className={`gate-access ${done ? "gate-access--visible" : ""}`}>
          <p className="gate-access-headline">// IDENTIFY_OPERATOR</p>
          {submitted ? (
            <div className="gate-access-success">
              <p>✓ OPERATOR_{nickname.toUpperCase()} — ACCESS_GRANTED</p>
              <p className="gate-redirect-hint">Redirecting to archive...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="gate-access-form">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ENTER_CALLSIGN"
                className="gate-input"
                maxLength={24}
                required
              />
              <button type="submit" className="gate-btn">
                REQUEST_ACCESS →
              </button>
            </form>
          )}
        </div>

        {/* Social nodes */}
        <div className={`gate-nodes ${done ? "gate-nodes--visible" : ""}`}>
          <a
            href="https://www.instagram.com/metallurg.tm"
            target="_blank"
            rel="noopener noreferrer"
            className="gate-node"
          >
            [ COMMS_01: INSTAGRAM ]
          </a>
          <span className="gate-node-sep">//</span>
          <a
            href="https://t.me/+W3cgJ6lB7_s0ODMy"
            target="_blank"
            rel="noopener noreferrer"
            className="gate-node"
          >
            [ COMMS_02: TELEGRAM ]
          </a>
        </div>
      </div>

      {/* Coordinates watermark */}
      <div className="gate-coords">
        <p>47.3769° N, 8.5417° E — ZÜRICH</p>
        <p>50.4501° N, 30.5234° E — KYIV</p>
      </div>
    </div>
  );
}
