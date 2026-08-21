import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <img
        src="/metallurg-void-fallback.png"
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 pointer-events-none select-none"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 z-10 px-8 text-center"
      >
        <p className="text-[9px] font-ibm-mono text-white/20 tracking-[0.5em] uppercase">
          // SYSTEM_ERROR :: 404
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-[4rem] md:text-[6rem] leading-none tracking-tighter text-white select-none"
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-2 -mt-4"
        >
          <p className="font-ibm-mono text-[11px] text-white/40 uppercase tracking-[0.3em]">
            ROUTE_NOT_FOUND
          </p>
          <p className="font-ibm-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
            The requested path does not exist in this inventory.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link
            to="/"
            className="inline-block border border-white/20 px-10 py-4 font-ibm-mono text-[10px] uppercase tracking-[0.3em] text-white/60 hover:border-white hover:text-white transition-all duration-300"
          >
            RETURN_TO_BASE →
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 z-10">
        <p className="font-ibm-mono text-[8px] text-white/10 tracking-[0.4em] uppercase">
          METALLURG™ — MTL_STORE_2026
        </p>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
