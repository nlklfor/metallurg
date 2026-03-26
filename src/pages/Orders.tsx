import { Footer, Navbar } from "@/components";
import { useState } from "react";
import TrackOrderModal from "@/components/TrackModal";
import { Package, Star } from "lucide-react";

export default function Orders() {
  const [trackOpen, setTrackOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />

      <div className="px-8 pt-16 pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-3">
              // ORDER_MANAGEMENT
            </p>
            <h2 className="text-6xl font-black text-black uppercase tracking-tighter italic">
              Orders & Reviews
            </h2>
          </div>
          <p className="text-[10px] text-gray-300 tracking-[0.3em] uppercase hidden md:block">
            METALLURG™ — DASHBOARD
          </p>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Track your orders and share your experience with the community.
          </p>
        </div>
      </div>

      <div className="px-8 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track Order Card */}
          <button
            onClick={() => setTrackOpen(true)}
            className="border border-gray-200 p-10 text-left hover:border-black transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package size={24} className="text-white" />
              </div>
              <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all text-xl">
                →
              </span>
            </div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-2">
              // TRACK_ORDER
            </p>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">
              Track Your Order
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Enter your order ID to see real-time delivery status and tracking information.
            </p>
          </button>

          {/* Reviews Card */}
          <div className="border border-gray-200 p-10 text-left relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
                <Star size={24} className="text-gray-300" />
              </div>
              <span className="text-[9px] text-gray-300 tracking-[0.3em] uppercase border border-gray-200 px-3 py-1">
                COMING_SOON
              </span>
            </div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-2">// REVIEWS</p>
            <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight mb-2">
              Customer Reviews
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Share your experience and read what others think about METALLURG™ products.
            </p>

            {/* Diagonal line overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-[141%] h-[1px] bg-gray-200 origin-top-left rotate-[35deg]" />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
