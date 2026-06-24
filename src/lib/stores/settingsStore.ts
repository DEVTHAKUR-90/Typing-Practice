"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TestSettings } from "@/types";
import { DEFAULT_DURATION, DEFAULT_WORD_COUNT, BLOCK_DEFENSE } from "@/lib/constants";

interface SettingsStore extends TestSettings {
  setMode: (mode: TestSettings["mode"]) => void;
  setDuration: (duration: number) => void;
  setWordCount: (count: number) => void;
  setWordList: (list: TestSettings["wordList"]) => void;
  setDifficulty: (d: TestSettings["difficulty"]) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  toggleCapitalization: () => void;
  setCustomText: (text: string) => void;
  setTheme: (theme: TestSettings["theme"]) => void;
  setBlockSpeed: (speed: number) => void;
  resetBlockSpeed: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      mode: "time",
      duration: DEFAULT_DURATION,
      wordCount: DEFAULT_WORD_COUNT,
      wordList: "common",
      difficulty: "normal",
      punctuation: false,
      numbers: false,
      capitalization: true,
      customText: "",
      theme: "aurora",
      blockSpeed: BLOCK_DEFENSE.defaultSpeed,
      setMode: (mode) => set({ mode }),
      setDuration: (duration) => set({ duration }),
      setWordCount: (wordCount) => set({ wordCount }),
      setWordList: (wordList) => set({ wordList }),
      setDifficulty: (difficulty) => set({ difficulty }),
      togglePunctuation: () => set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      toggleCapitalization: () => set((s) => ({ capitalization: !s.capitalization })),
      setCustomText: (customText) => set({ customText }),
      setTheme: (theme) => set({ theme }),
      setBlockSpeed: (blockSpeed) =>
        set({
          blockSpeed: Math.min(BLOCK_DEFENSE.maxSpeed, Math.max(BLOCK_DEFENSE.minSpeed, blockSpeed)),
        }),
      resetBlockSpeed: () => set({ blockSpeed: BLOCK_DEFENSE.defaultSpeed }),
    }),
    {
      name: "typing-master-settings",
      // We rehydrate manually (see useHydrated) once the component tree has
      // mounted, so the very first client render still matches the
      // server-rendered defaults. Without this, a returning visitor with
      // saved settings would get a React hydration mismatch plus a visible
      // flash of default settings before snapping to their saved ones.
      skipHydration: true,
    }
  )
);
