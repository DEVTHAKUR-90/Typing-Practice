"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTypingEngine, EngineConfig } from "@/lib/hooks/useTypingEngine";
import { useHistoryStore } from "@/lib/stores/historyStore";
import { useFocusModeStore } from "@/lib/stores/focusModeStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { formatTime } from "@/lib/utils";
import WordDisplay from "./WordDisplay";
import LiveStats from "./LiveStats";
import StatsDashboard from "@/components/stats/StatsDashboard";
import GlassmorphismContainer from "@/components/layout/GlassmorphismContainer";

interface TypingTestProps {
  config: EngineConfig;
}

export default function TypingTest({ config }: TypingTestProps) {
  const engine = useTypingEngine(config);
  const addResult = useHistoryStore((s) => s.addResult);
  const focusMode = useFocusModeStore((s) => s.focusMode);
  const enterFocusMode = useFocusModeStore((s) => s.enter);
  const settingsOpen = useUIStore((s) => s.settingsOpen);

  const target = useMemo(
    () => (config.mode === "time" ? config.duration : config.mode === "words" ? config.wordCount : 0),
    [config.mode, config.duration, config.wordCount]
  );

  useEffect(() => {
    if (!engine.result) return;
    addResult(engine.result, target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.result]);

  // Tab restarts the test, matching the convention most typing-test sites
  // use. Scoped to only fire when the typing input itself (or nothing) has
  // focus — otherwise it would hijack normal Tab navigation inside the
  // settings drawer or between header buttons.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (settingsOpen) return;
      const active = document.activeElement;
      const isTypingInput = active?.getAttribute("aria-label") === "Typing input";
      const isUnfocused = active === document.body || active === null;
      if (!isTypingInput && !isUnfocused) return;
      e.preventDefault();
      engine.reset();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [engine.reset, settingsOpen]);

  // Enter (before the test has started) drops into a distraction-free
  // fullscreen view — same idea as Monkeytype's focus mode. We use the real
  // Fullscreen API rather than just a CSS overlay, specifically because Esc
  // then exits it for free: every browser already does that for any
  // fullscreen element, so there's no custom Esc handler to get wrong.
  // requestFullscreen() can reject (permissions, non-HTTPS, etc.) — if it
  // does, we still drop the UI chrome via our own state, so the feature
  // degrades gracefully instead of silently doing nothing.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (engine.status !== "idle" || focusMode || settingsOpen) return;
      const active = document.activeElement;
      const isTypingInput = active?.getAttribute("aria-label") === "Typing input";
      const isUnfocused = active === document.body || active === null;
      if (!isTypingInput && !isUnfocused) return;
      e.preventDefault();
      document.documentElement.requestFullscreen?.()?.catch(() => {});
      enterFocusMode();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [engine.status, focusMode, settingsOpen, enterFocusMode]);

  // Defensive: if this instance unmounts while still in fullscreen (e.g. a
  // settings change forces a remount), don't leave the browser stuck in
  // fullscreen with no header to recover from — FocusModeSync (mounted at
  // the page level) will pick up the resulting fullscreenchange event and
  // reset the UI state regardless of why this unmounted.
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.()?.catch(() => {});
      }
    };
  }, []);

  if (engine.result) {
    return <StatsDashboard result={engine.result} target={target} onRestart={engine.reset} />;
  }

  const wordsRemaining = Math.max(0, engine.words.length - engine.currentWordIndex);

  const progress =
    config.mode === "time"
      ? Math.min(1, engine.elapsed / config.duration)
      : config.mode === "words" || config.mode === "custom"
        ? Math.min(1, engine.currentWordIndex / Math.max(engine.words.length, 1))
        : null;

  if (focusMode) {
    const topCounter =
      config.mode === "time"
        ? formatTime(engine.timeLeft)
        : config.mode === "words" || config.mode === "custom"
          ? `${Math.min(engine.currentWordIndex + 1, engine.words.length)}/${engine.words.length}`
          : formatTime(engine.elapsed);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 px-4"
      >
        <span className="font-mono text-4xl font-semibold text-accent-amber">{topCounter}</span>

        <div className="w-full">
          <WordDisplay
            words={engine.words}
            currentWordIndex={engine.currentWordIndex}
            currentInput={engine.currentInput}
            status={engine.status}
            onKeyStroke={engine.handleKey}
          />
        </div>

        {engine.status === "running" && (
          <span className="font-mono text-5xl font-bold text-accent-teal">{engine.liveWpm}</span>
        )}

        {config.mode === "zen" && engine.status === "running" && (
          <button
            onClick={engine.finish}
            className="text-xs text-muted-theme hover:text-accent-amber"
          >
            finish session
          </button>
        )}

        <span className="absolute bottom-5 right-5 text-[10px] text-muted-theme/60">
          esc to exit
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex w-full max-w-3xl flex-col items-center gap-6"
    >
      <LiveStats
        mode={config.mode}
        timeLeft={engine.timeLeft}
        elapsed={engine.elapsed}
        wordsRemaining={wordsRemaining}
        liveWpm={engine.liveWpm}
        liveAccuracy={engine.liveAccuracy}
        status={engine.status}
      />
      <GlassmorphismContainer className="w-full p-6 sm:p-8" shimmer>
        <WordDisplay
          words={engine.words}
          currentWordIndex={engine.currentWordIndex}
          currentInput={engine.currentInput}
          status={engine.status}
          onKeyStroke={engine.handleKey}
        />
        {progress !== null && (
          <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-[var(--glass-border)]">
            <motion.div
              className="h-full rounded-full bg-[color:var(--accent-teal)]"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        )}
      </GlassmorphismContainer>
      {config.mode === "zen" && engine.status === "running" && (
        <button
          onClick={engine.finish}
          className="glass-panel glass-panel-hover rounded-full px-5 py-2 text-sm text-muted-theme hover:text-accent-amber"
        >
          Finish session
        </button>
      )}
      <p className="text-[11px] text-muted-theme">
        press <kbd className="rounded bg-[var(--glass-bg)] px-1.5 py-0.5 font-mono">tab</kbd> to
        restart <span className="px-1 opacity-50">·</span> press{" "}
        <kbd className="rounded bg-[var(--glass-bg)] px-1.5 py-0.5 font-mono">enter</kbd> for focus
        mode
      </p>
    </motion.div>
  );
}
