"use client";

import { motion } from "framer-motion";
import { Hash, Timer, Feather, FileText, Swords } from "lucide-react";
import clsx from "clsx";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { TestMode } from "@/types";
import { TEST_DURATIONS, TEST_WORD_COUNTS } from "@/lib/constants";

const MODES: { key: TestMode; label: string; icon: typeof Timer }[] = [
  { key: "time", label: "Time", icon: Timer },
  { key: "words", label: "Words", icon: Hash },
  { key: "zen", label: "Zen", icon: Feather },
  { key: "custom", label: "Custom", icon: FileText },
  { key: "blocks", label: "Block Defence", icon: Swords },
];

export default function ModeSelector() {
  const mode = useSettingsStore((s) => s.mode);
  const duration = useSettingsStore((s) => s.duration);
  const wordCount = useSettingsStore((s) => s.wordCount);
  const punctuation = useSettingsStore((s) => s.punctuation);
  const numbers = useSettingsStore((s) => s.numbers);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setMode = useSettingsStore((s) => s.setMode);
  const setDuration = useSettingsStore((s) => s.setDuration);
  const setWordCount = useSettingsStore((s) => s.setWordCount);
  const togglePunctuation = useSettingsStore((s) => s.togglePunctuation);
  const toggleNumbers = useSettingsStore((s) => s.toggleNumbers);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="glass-panel flex flex-wrap items-center justify-center gap-1 rounded-full p-1 shadow-glass">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium active:scale-95 transition-transform"
          >
            {mode === key && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-aurora-teal/90 shadow-glow"
              />
            )}
            <span
              className={clsx(
                "relative z-10 flex items-center gap-1.5 transition-colors duration-200",
                mode === key ? "text-midnight-deep" : "text-muted-theme hover:text-[color:var(--text-primary)]"
              )}
            >
              <Icon size={14} strokeWidth={2.25} />
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {(mode === "time" || mode === "words" || mode === "zen") && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          {(mode === "time" || mode === "words") && (
            <>
              {(mode === "time" ? TEST_DURATIONS : TEST_WORD_COUNTS).map((val) => (
                <button
                  key={val}
                  onClick={() => (mode === "time" ? setDuration(val) : setWordCount(val))}
                  className={clsx(
                    "rounded-full px-3 py-1 font-mono transition-colors active:scale-95",
                    (mode === "time" ? duration : wordCount) === val
                      ? "text-accent-amber"
                      : "text-muted-theme hover:text-[color:var(--text-primary)]"
                  )}
                >
                  {val}
                </button>
              ))}
              <span className="mx-1 h-3 w-px bg-[var(--glass-border)]" />
            </>
          )}

          <button
            onClick={togglePunctuation}
            className={clsx(
              "rounded-full px-3 py-1 font-mono transition-colors active:scale-95",
              punctuation ? "text-accent-magenta" : "text-muted-theme hover:text-[color:var(--text-primary)]"
            )}
          >
            punctuation
          </button>
          <button
            onClick={toggleNumbers}
            className={clsx(
              "rounded-full px-3 py-1 font-mono transition-colors active:scale-95",
              numbers ? "text-accent-magenta" : "text-muted-theme hover:text-[color:var(--text-primary)]"
            )}
          >
            numbers
          </button>
          <button
            onClick={() => setDifficulty(difficulty === "normal" ? "advanced" : "normal")}
            className={clsx(
              "rounded-full px-3 py-1 font-mono transition-colors active:scale-95",
              difficulty === "advanced" ? "text-accent-coral" : "text-muted-theme hover:text-[color:var(--text-primary)]"
            )}
          >
            advanced
          </button>
        </motion.div>
      )}
    </div>
  );
}
