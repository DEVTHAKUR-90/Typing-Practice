"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import DynamicBackground from "@/components/layout/DynamicBackground";
import Header from "@/components/layout/Header";
import SettingsPanel from "@/components/layout/SettingsPanel";
import FocusModeSync from "@/components/layout/FocusModeSync";
import TypingTest from "@/components/typing/TypingTest";
import BlockDefenseGame from "@/components/game/BlockDefenseGame";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useHydrated } from "@/lib/stores/useHydrated";
import { useFocusModeStore } from "@/lib/stores/focusModeStore";
import { useUIStore } from "@/lib/stores/uiStore";

export default function Home() {
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const openSettings = useUIStore((s) => s.openSettings);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const hydrated = useHydrated();
  const focusMode = useFocusModeStore((s) => s.focusMode);

  const mode = useSettingsStore((s) => s.mode);
  const duration = useSettingsStore((s) => s.duration);
  const wordCount = useSettingsStore((s) => s.wordCount);
  const wordList = useSettingsStore((s) => s.wordList);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const punctuation = useSettingsStore((s) => s.punctuation);
  const numbers = useSettingsStore((s) => s.numbers);
  const capitalization = useSettingsStore((s) => s.capitalization);
  const customText = useSettingsStore((s) => s.customText);

  const config = useMemo(
    () => ({
      mode,
      duration,
      wordCount,
      wordList,
      difficulty,
      punctuation,
      numbers,
      capitalization,
      customText,
    }),
    [mode, duration, wordCount, wordList, difficulty, punctuation, numbers, capitalization, customText]
  );

  // Settings/history are persisted to localStorage with `skipHydration`, and
  // only loaded in after mount via useHydrated(). Until that completes, the
  // store holds the same defaults the server rendered with (no mismatch),
  // and we hold off mounting the test engine so a returning visitor doesn't
  // briefly see a default-config test get thrown away and rebuilt.
  const configKey = useMemo(() => JSON.stringify(config), [config]);

  return (
    <main className="relative flex min-h-screen flex-col items-center">
      <DynamicBackground />
      <FocusModeSync />

      {!hydrated ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--accent-teal)_40%,transparent)]" />
        </div>
      ) : (
        <>
          <AnimatePresence>{!focusMode && <Header onOpenSettings={openSettings} />}</AnimatePresence>
          <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />

          <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
            {mode === "blocks" ? (
              <BlockDefenseGame key={wordList} wordList={wordList} />
            ) : (
              <TypingTest key={configKey} config={config} />
            )}
          </section>

          {!focusMode && (
            <footer className="pb-6 text-center text-[11px] text-muted-theme">
              Dev Thakur <span className="px-1 opacity-50">•</span> Premium Interactive Experience
            </footer>
          )}
        </>
      )}
    </main>
  );
}
