import { create } from 'zustand';

interface AppState {
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasOnboarded: false,
  setHasOnboarded: (value) => set({ hasOnboarded: value }),
}));
