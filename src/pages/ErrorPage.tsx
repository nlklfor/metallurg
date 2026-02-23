import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <Navbar variant="dark" />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md border border-gray-700 bg-gray-950 p-8">
          <h2 className="text-white font-bold mb-2 uppercase tracking-widest">
            Critical_System_Error
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Something went wrong. Please try again later.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-white border border-gray-600 px-6 py-3 hover:bg-white hover:text-black transition-all w-full"
          >
            RETURN_TO_BASE
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}