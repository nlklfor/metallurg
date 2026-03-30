import { create } from "zustand";

interface GateState {
  unlocked: boolean;
  unlock: () => void;
}

export const useGateStore = create<GateState>((set) => ({
  unlocked: sessionStorage.getItem("mtl_gate") === "1",
  unlock: () => {
    sessionStorage.setItem("mtl_gate", "1");
    set({ unlocked: true });
  },
}));
