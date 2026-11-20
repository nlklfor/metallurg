import Wordmark from "@/components/brand/Wordmark";
import "@google/model-viewer";
import mtlLogoGlb from "@/assets/icons/logo-mtl.glb?url";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Seo from "@/components/seo/Seo";

// QR gate /gate/mtl-ch-ua (design file: Gate-D / Gate-M). Same boot log, 3D
// chrome logo and links as before; new layout: log + progress left, logo and
// ENTER_ARCHIVE centre, nodes right (stacked on phones). Exit keeps the old
// glitch (.gate-root--exit in index.css).

const BOOT_LINES = [
  "[SYS] Initializing METALLURG_CORE v2.6.0...",
  "[SYS] Loading_textures ██████████ OK",
  "[NET] UA_Warehouse_Connected",
  "[DB]  Syncing_inventory_nodes...",
  "[SEC] Verifying_operator_clearance...",
  "[SYS] Archive_index_rebuilt (1,247 objects)",
  "[NET] UA_NODE_50.45N — ONLINE",
  "[SYS] STATUS: DEPLOYING_METALLURG_PROTOCOL",
];

const LINKS = [
  { href: "https://www.instagram.com/metallurg.tm", label: "COMMS_01: INSTAGRAM" },
  { href: "https://t.me/+W3cgJ6lB7_s0ODMy", label: "COMMS_02: TELEGRAM" },
];

function useBootLog() {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const idx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idx.current < BOOT_LINES.length) {
        // read the line before the updater runs (it may run later, after idx moved on)
        const line = BOOT_LINES[idx.current];
        setLines((prev) => [...prev, line]);
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

/** "[NET] UA_NODE_50.45N — ONLINE" → status words in green. */
function LogLine({ line }: { line: string }) {
  const m = (line ?? "").match(/^(.*?)(ONLINE|DONE|OK)$/);
  if (!m) return <>{line}</>;
  return (
    <>
      {m[1]}
      <span className="text-status-ok">{m[2]}</span>
    </>
  );
}

function Progress({ progress, done }: { progress: number; done: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between text-[10px] tracking-[0.15em]">
        <span className="text-gray-400">
          {done ? "SYSTEM_ONLINE" : "INITIALIZING_ARCHIVE_CORE"}
        </span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 border border-paper p-px">
        <div
          className="h-full bg-paper transition-[width] duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function WelcomeGate() {
  const { lines, progress, done } = useBootLog();
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => navigate("/"), 1500);
  };

  const enter = (
    <button
      type="button"
      onClick={handleEnter}
      disabled={!done || exiting}
      className={cn(
        "flex h-14 w-full items-center justify-center bg-paper text-[13px] font-bold tracking-[0.2em] text-ink transition-all duration-500 hover:bg-gray-200 lg:h-[60px] lg:w-[360px] lg:text-[14px]",
        done ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      ENTER_ARCHIVE →
    </button>
  );

  const links = (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] tracking-[0.15em] transition-opacity duration-700 lg:flex-col lg:items-end lg:gap-1.5",
        done ? "opacity-100" : "opacity-0"
      )}
    >
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="!text-gray-400 hover:!text-paper"
        >
          [ {l.label} ]
        </a>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "relative min-h-[100dvh] w-full overflow-hidden bg-ink font-mono text-paper",
        exiting && "gate-root--exit"
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
      }}
    >
      <Seo />
      <div className="gate-grain" />

      <div className="relative z-20 grid min-h-[100dvh] grid-cols-1 gap-6 px-5 pb-8 pt-12 lg:grid-cols-[420px_minmax(0,1fr)_320px] lg:gap-12 lg:px-12 lg:py-10">
        {/* ─── Boot log + progress ─── */}
        <div className="flex flex-col gap-5 lg:gap-7">
          <div className="flex justify-between text-[10px] tracking-[0.15em] text-gray-500 lg:justify-start">
            <span>/GATE/MTL-CH-UA</span>
            <span className="lg:ml-2">// v2.6</span>
          </div>
          <div
            className="flex min-h-[230px] flex-col text-[11px] leading-[1.9] tracking-[0.04em] lg:min-h-0 lg:text-[12px] lg:leading-[2.2]"
            aria-live="polite"
          >
            {lines.map((line, i) => (
              <p
                key={i}
                className={cn("truncate", i < lines.length - 1 ? "text-gray-500" : "text-paper")}
              >
                <LogLine line={line} />
                {i === lines.length - 1 && !done && <span className="animate-blink-cursor">█</span>}
              </p>
            ))}
          </div>
          <div className="mt-auto hidden lg:block">
            <Progress progress={progress} done={done} />
          </div>
        </div>

        {/* ─── Logo + enter ─── */}
        <div className="flex flex-col items-center justify-center gap-6 lg:gap-10">
          <div className="h-[220px] w-full max-w-[360px] lg:h-[340px] lg:max-w-[460px]">
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
              alt="MTL logo"
              style={{ width: "100%", height: "100%", background: "transparent", outline: "none" }}
            />
          </div>
          <h1 className="text-[28px] lg:text-[48px]">
            <Wordmark encryptedClassName="text-neutral-500" />
          </h1>
          <div className="hidden w-full justify-center lg:flex">{enter}</div>
        </div>

        {/* ─── Phones: progress + enter + links ─── */}
        <div className="mt-auto flex flex-col gap-4 lg:hidden">
          <Progress progress={progress} done={done} />
          {enter}
          {links}
        </div>

        {/* ─── Nodes (desktop) ─── */}
        <div className="hidden flex-col justify-between text-right text-[10px] leading-[1.9] tracking-[0.15em] text-gray-400 lg:flex">
          <span />
          {links}
          <div>
            <span className="text-paper">UA_NODE</span>
            <br />
            KYIV
            <br />
            50.4501° N, 30.5234° E
          </div>
        </div>
      </div>
    </div>
  );
}
