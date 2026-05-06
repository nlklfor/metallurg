import { Navigate } from "react-router-dom";
import { useGateStore } from "@/stores/useGateStore";

export default function GateGuard({ children }: { children: React.ReactNode }) {
  const unlocked = useGateStore((s) => s.unlocked);

  if (!unlocked) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
