import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <Navbar variant="dark" />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-7xl font-black mb-4 italic tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em]">
            Product_not_found.
          </h2>
          <p className="text-gray-400 mb-8">
            The product you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.3em] hover:bg-gray-200 transition-colors"
          >
            Return_to_Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}