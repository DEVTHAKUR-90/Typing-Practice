"use client";

import { create } from "zustand";

interface FocusModeStore {
  focusMode: boolean;
  enter: () => void;
  exit: () => void;
}

// Deliberately not persisted — this is runtime UI state (whether we're in
// the distraction-free fullscreen view), not a user preference that should
// survive a reload.
export const useFocusModeStore = create<FocusModeStore>((set) => ({
  focusMode: false,
  enter: () => set({ focusMode: true }),
  exit: () => set({ focusMode: false }),
}));
