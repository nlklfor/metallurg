import { Footer, Navbar } from "@/components";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useState } from "react";
import TrackOrderModal from "@/components/TrackModal";
import ReviewModal from "@/components/ReviewModal";
import ReviewList from "@/components/ReviewList";
import { useAllReviews } from "@/hooks/useAllReviews";
import { Package, Star } from "lucide-react";
import supabase from "@/lib/supabase";

interface ResolvedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  items: { name: string; selectedSize: string | number; price: number }[];
}

export default function Orders() {
  const [trackOpen, setTrackOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<ResolvedOrder | null>(null);
  const [orderInput, setOrderInput] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { reviews, stats, isLoading: reviewsLoading, refetch } = useAllReviews();

  const handleReviewLookup = async () => {
    const trimmed = orderInput.trim().toUpperCase();
    if (!trimmed) return;

    setIsLookingUp(true);
    setLookupError("");

    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, status, items")
      .eq("order_number", trimmed)
      .single();

    setIsLookingUp(false);

    if (error || !data) {
      setLookupError("Order not found — please check the order number and try again.");
      return;
    }

    if (data.status !== "completed") {
      setLookupError("ORDER_NOT_COMPLETED — Only delivered orders can be reviewed.");
      return;
    }

    setReviewOrder({
      id: data.id,
      order_number: data.order_number,
      customer_name: data.customer_name,
      items: data.items,
    });
    setReviewOpen(true);
    setOrderInput("");
    setLookupError("");
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar variant="light" />
      <div className="px-4 sm:px-8 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
      </div>
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />
      {reviewOrder && (
        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => {
            setReviewOpen(false);
            setReviewOrder(null);
          }}
          onSubmitted={() => {
            refetch();
          }}
          orderNumber={reviewOrder.order_number}
          customerName={reviewOrder.customer_name}
          orderId={reviewOrder.id}
          orderItems={reviewOrder.items}
        />
      )}

      <div className="px-4 sm:px-8 pt-8 sm:pt-16 pb-6 sm:pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-3">
              // ORDER_MANAGEMENT
            </p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-black uppercase tracking-tighter italic">
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

      <div className="px-4 sm:px-8 pb-8 sm:pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track Order Card */}
          <button
            onClick={() => setTrackOpen(true)}
            className="border border-gray-200 p-5 sm:p-10 text-left hover:border-black transition-all group"
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
          <div className="border border-gray-200 p-5 sm:p-10 text-left hover:border-black transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-black flex items-center justify-center group-hover:scale-105 transition-transform">
                <Star size={24} className="text-white" />
              </div>
            </div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase mb-2">
              // FIELD_REPORT
            </p>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-3">
              Submit a Review
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Share your field report. Enter your completed order ID to begin.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReviewLookup()}
                placeholder="MTL-1234"
                className="flex-1 font-ibm-mono border border-gray-200 px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black uppercase tracking-[0.2em] transition-colors"
              />
              <button
                onClick={handleReviewLookup}
                disabled={isLookingUp || !orderInput.trim()}
                className="bg-black text-white px-5 font-archivo-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {isLookingUp ? "..." : "GO →"}
              </button>
            </div>
            {lookupError && (
              <p className="text-[9px] font-ibm-mono text-red-500 mt-2 tracking-[0.2em] uppercase">
                ✗ {lookupError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* All Reviews Section */}
      <div className="bg-black text-white px-4 sm:px-8 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase mb-3">
            // ALL_FIELD_REPORTS
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-10">
            Community Reports
            {stats.count > 0 && (
              <span className="text-zinc-600 text-lg ml-3 not-italic">({stats.count})</span>
            )}
          </h2>
          <ReviewList reviews={reviews} stats={stats} isLoading={reviewsLoading} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
