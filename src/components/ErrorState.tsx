import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error?: string | null;
}

export default function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="border border-gray-700 bg-gray-950 p-8 max-w-md text-center">
        <h2 className="text-white font-bold mb-2 uppercase tracking-widest">
          Critical_System_Error
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {error || "COMPONENT_NOT_FOUND"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-white border border-gray-600 px-6 py-2 hover:bg-white hover:text-black transition-all"
        >
          RETURN_TO_BASE
        </button>
      </div>
    </div>
  );
}