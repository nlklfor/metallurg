import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { FAQ } from "@/lib/constants/contact";
import { TELEGRAM_BOT } from "@/lib/constants/navigation";
import { DURATION, EASE_MTL } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useContact } from "@/hooks/useContact";
import Seo from "@/components/seo/Seo";

// Contact (design file: Contact-D / Contact-M). The NETWORK_NODES map from
// the design is left out (no Zürich/Kyiv routing on the site); its column
// holds the FAQ instead, folded so the page stays quiet.

const CHANNELS = [
  { href: "https://t.me/+W3cgJ6lB7_s0ODMy", label: "TELEGRAM_CHANNEL", note: "" },
  { href: `https://t.me/${TELEGRAM_BOT}`, label: "TELEGRAM_BOT", note: "ORDERS / ALERTS" },
  { href: "https://www.instagram.com/metallurg.tm", label: "INSTAGRAM", note: "@metallurg.tm" },
];

const fieldClass =
  "w-full border border-rule bg-transparent px-3.5 text-[16px] text-ink outline-none transition-colors placeholder:text-dim-dark focus:border-ink lg:text-[14px]";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow text-[10px] text-dim">
      {children}
    </label>
  );
}

function Channels() {
  return (
    <div className="flex flex-col">
      <span className="eyebrow mb-2 text-[10px] text-dim">// CHANNELS</span>
      <ul className="border-t border-ink">
        {CHANNELS.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-14 items-center justify-between border-b border-rule text-[12px] tracking-[0.08em] lg:h-[60px] lg:text-[13px]"
            >
              <span>
                {c.label}
                {c.note && <span className="ml-2 text-[11px] text-dim">// {c.note}</span>}
              </span>
              <span className="transition-transform duration-200 ease-mtl group-hover:translate-x-1">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex flex-col">
      <span className="eyebrow mb-2 text-[10px] text-dim">// FAQ</span>
      <ul className="border-t border-ink">
        {FAQ.map((item) => {
          const isOpen = open === item.id;
          return (
            <li key={item.id} className="border-b border-rule">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${item.id}`}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex h-14 w-full items-center justify-between text-left text-[12px] tracking-[0.08em] lg:h-[60px] lg:text-[13px]"
              >
                {item.q}
                <span aria-hidden="true" className="text-dim">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: DURATION.page, ease: EASE_MTL }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[560px] pb-4 text-[12px] leading-relaxed text-[#374151] lg:text-[13px]">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Contact() {
  const {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    isLoading,
    sent,
    error,
    isValid,
    submit,
    reset,
  } = useContact();

  const form = (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.page, ease: EASE_MTL }}
          className="flex flex-col gap-3 border border-ink p-5 lg:p-6"
          role="status"
        >
          <span className="eyebrow text-[10px] text-[#15803D]">// MESSAGE_SENT</span>
          <p className="text-[13px] leading-relaxed">
            We'll answer within 24 hours. For anything urgent, write to us in Telegram.
          </p>
          <button
            type="button"
            onClick={reset}
            className="h-10 self-start text-[11px] tracking-[0.15em] underline underline-offset-[5px]"
          >
            SEND_ANOTHER →
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-3.5 lg:gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <span className="eyebrow text-[10px] text-dim">// MESSAGE_FORM</span>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name">// NAME</Label>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER_NAME"
                autoComplete="name"
                className={cn(fieldClass, "h-[52px]")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">// EMAIL</Label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                autoComplete="email"
                className={cn(fieldClass, "h-[52px]")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-message">// MESSAGE</Label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Order ID, object, question…"
              rows={6}
              className={cn(fieldClass, "h-40 resize-none py-3.5 lg:h-[200px]")}
            />
          </div>

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.chip, ease: EASE_MTL }}
                className="flex flex-col gap-1.5 border border-status-error p-3"
              >
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#B91C1C]">
                  // MESSAGE_NOT_SENT
                </span>
                <span className="text-[12px]">
                  Something went wrong. Your text is kept — try again, or write to us in Telegram.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="flex h-14 items-center justify-center bg-ink text-[13px] font-bold tracking-[0.15em] text-paper transition-colors hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-40 lg:h-[60px]"
          >
            {isLoading ? (
              <>
                SENDING<span className="animate-blink-cursor">█</span>
              </>
            ) : (
              "SEND_MESSAGE →"
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-mono text-ink">
      <Seo />
      <Navbar variant="light" />

      <div className="px-4 pt-3.5 sm:px-8 sm:pt-5 md:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </div>

      <header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
        <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">Contact</h1>
        <div className="h-px bg-ink" />
        <p className="text-[12px] leading-relaxed lg:text-[13px]">
          Fastest line: Telegram. The form reaches the same people.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 px-4 pb-16 sm:px-8 md:px-12 lg:grid-cols-12 lg:gap-x-6 lg:pb-24">
        {/* Phones: channels first (fastest), then form, then FAQ. */}
        <div className="flex flex-col gap-10 lg:col-span-5 lg:gap-12">
          <div className="order-2 lg:order-1">{form}</div>
          <div className="order-1 lg:order-2">
            <Channels />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Faq />
        </div>
      </div>

      <Footer />
    </div>
  );
}
