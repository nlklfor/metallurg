import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Iphone } from "@/components/ui/iphone";
import phone from "@/assets/images/phone-screenshot.png";
import { Instagram, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />

      <div className="px-8 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </div>
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-3">
              // CONNECT_WITH_US
            </p>
            <h2 className="text-6xl font-black text-black uppercase tracking-tighter italic">
              Contact
            </h2>
          </div>
          <p className="text-[10px] text-gray-300 tracking-[0.3em] uppercase hidden md:block">
            METALLURG™ — SUPPORT
          </p>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Have a question or want to get in touch? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="px-8 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Contact Info */}
          <div className="space-y-10">
            <div className="space-y-6">
              <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase">// CHANNELS</p>

              <a
                href="https://instagram.com/metallurg.tm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group border border-gray-200 p-5 hover:border-black transition-all"
              >
                <div className="w-12 h-12 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Instagram size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black uppercase tracking-wider">Instagram</p>
                  <p className="text-[10px] text-gray-400 tracking-[0.2em]">@metallurg.tm</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                  →
                </span>
              </a>

              <a
                href="https://t.me/+W3cgJ6lB7_s0ODMy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group border border-gray-200 p-5 hover:border-black transition-all"
              >
                <div className="w-12 h-12 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black uppercase tracking-wider">Telegram</p>
                  <p className="text-[10px] text-gray-400 tracking-[0.2em]">METALLURG_COMMUNITY</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                  →
                </span>
              </a>
            </div>

            <div className="border border-gray-200 p-6 space-y-3">
              <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase">
                // RESPONSE_TIME
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                We typically respond within <span className="text-black font-bold">24 hours</span>.
                For urgent inquiries, reach us via Telegram.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-gray-400 tracking-[0.3em] uppercase">
                  STATUS: ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex flex-col items-center">
            <p className="text-[8px] text-gray-300 tracking-[0.4em] uppercase mb-6">
              // PREVIEW_FEED
            </p>
            <div className="w-[320px] dark">
              <Iphone src={phone} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
