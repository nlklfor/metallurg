import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Shop() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar variant="light" />

      <div className="px-8 py-16">
        <h2 className="text-5xl font-bold text-black mb-4">Shop</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Discover our premium collection of streetwear and contemporary fashion. Carefully curated pieces designed for the modern individual.
        </p>
      </div>

      {/* Content Area */}
      <div className="px-8 pb-16">
        {/* Placeholder for filters and cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters will go here */}
          {/* Cards will go here */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

