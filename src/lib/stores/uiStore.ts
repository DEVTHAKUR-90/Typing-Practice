"use client";

import { create } from "zustand";

interface UIStore {
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

// Runtime UI state, not a persisted preference — whether the settings
// drawer is open shouldn't survive a reload, and other components (the
// focus-mode trigger) need to read it to avoid stepping on each other.
export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
}));
