"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PersonalBest, TestResult } from "@/types";

interface HistoryStore {
  results: TestResult[];
  bests: PersonalBest[];
  addResult: (result: TestResult, target: number) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      results: [],
      bests: [],
      addResult: (result, target) => {
        const results = [result, ...get().results].slice(0, 50);
        const bests = [...get().bests];
        const idx = bests.findIndex((b) => b.mode === result.mode && b.target === target);
        if (idx === -1 || bests[idx].wpm < result.wpm) {
          const entry: PersonalBest = {
            mode: result.mode,
            target,
            wpm: result.wpm,
            accuracy: result.accuracy,
            timestamp: result.timestamp,
          };
          if (idx === -1) bests.push(entry);
          else bests[idx] = entry;
        }
        set({ results, bests });
      },
    }),
    { name: "typing-master-history", skipHydration: true }
  )
);
