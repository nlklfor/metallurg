import { Footer, Navbar } from "@/components";

export default function Orders() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar variant="light" />

      <div className="px-8 py-16">
        <h2 className="text-5xl font-bold text-black mb-4">Orders & Reviews</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Orders and reviews will be displayed here in the future. Stay tuned
          for updates!
        </p>
      </div>

      <Footer />
    </div>
  );
}
