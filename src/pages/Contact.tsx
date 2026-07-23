import { motion, AnimatePresence } from "framer-motion";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import NetworkNodesMap from "@/components/contact/NetworkNodesMap";
import { Send } from "lucide-react";
import { useContact } from "@/hooks/useContact";

export default function Contact() {
  const { name, setName, message, setMessage, isLoading, sent, error, isValid, submit, reset } =
    useContact();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />

      <div className="px-4 sm:px-8 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </div>

      <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.28em] sm:tracking-[0.4em] uppercase mb-2 sm:mb-3">
              // CONNECT_WITH_US
            </p>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-black uppercase tracking-tighter italic">
              Contact
            </h2>
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.22em] sm:tracking-[0.3em] uppercase hidden md:block">
            METALLURG™ — SUPPORT
          </p>
        </div>
        <div className="border-t border-gray-200 mt-4 sm:mt-6 pt-4 sm:pt-6">
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Have a question or want to get in touch? Drop us a message and we'll get back to you.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-10 sm:pb-16 flex-1">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="w-full lg:max-w-md space-y-8">
            {/* Contact Form */}
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border border-gray-200 p-6 sm:p-8 space-y-4"
                >
                  <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.4em] uppercase">
                    // MESSAGE_SENT
                  </p>
                  <p className="text-sm font-archivo-black uppercase tracking-widest text-black">
                    TRANSMISSION_COMPLETE
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We received your message and will get back to you within{" "}
                    <span className="text-black font-bold">24 hours</span>.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-2 text-[9px] font-ibm-mono uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-px"
                  >
                    SEND_ANOTHER →
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.4em] uppercase">
                    // SEND_MESSAGE
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-ibm-mono uppercase tracking-[0.35em] text-gray-400 mb-1.5">
                        YOUR_NAME
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-gray-200 px-4 py-3 text-sm font-ibm-mono text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-ibm-mono uppercase tracking-[0.35em] text-gray-400 mb-1.5">
                        MESSAGE
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={5}
                        className="w-full bg-white border border-gray-200 px-4 py-3 text-sm font-ibm-mono text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-ibm-mono text-red-500 tracking-[0.2em] uppercase"
                      >
                        ✗ {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={submit}
                    disabled={!isValid || isLoading}
                    className="w-full bg-black text-white py-4 font-archivo-black text-[11px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        TRANSMITTING...
                      </motion.span>
                    ) : (
                      "SEND_MESSAGE →"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Socials */}
            <div className="space-y-3">
              <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.4em] uppercase">
                // CHANNELS
              </p>

              <a
                href="https://instagram.com/metallurg.tm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 group border border-gray-200 p-4 hover:border-black transition-all"
              >
                <div className="w-9 h-9 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Instagram</p>
                  <p className="text-[8px] text-gray-400 tracking-[0.2em]">@metallurg.tm</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                  →
                </span>
              </a>

              <a
                href="https://t.me/+W3cgJ6lB7_s0ODMy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 group border border-gray-200 p-4 hover:border-black transition-all"
              >
                <div className="w-9 h-9 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Telegram</p>
                  <p className="text-[8px] text-gray-400 tracking-[0.2em]">METALLURG_COMMUNITY</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                  →
                </span>
              </a>

              <div className="border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[8px] font-ibm-mono text-gray-400 tracking-[0.3em] uppercase">
                    STATUS: ONLINE — RESPONSE ~24H
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:max-w-lg lg:mt-20 lg:sticky lg:top-32">
            <NetworkNodesMap />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
