import { create } from "zustand";

// Desktop loadout sidebar: opened from the navbar LOADOUT button.
interface LoadoutDrawerState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useLoadoutDrawer = create<LoadoutDrawerState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
