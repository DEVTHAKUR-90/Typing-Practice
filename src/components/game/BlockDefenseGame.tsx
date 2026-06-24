"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, RotateCcw, Sparkles, TrendingUp, Zap } from "lucide-react";
import clsx from "clsx";
import { useBlockDefenseGame } from "@/lib/hooks/useBlockDefenseGame";
import { BLOCK_DEFENSE } from "@/lib/constants";
import { WordListKey } from "@/types";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import GlassmorphismContainer from "@/components/layout/GlassmorphismContainer";
import SpeedSlider from "./SpeedSlider";

interface BlockDefenseGameProps {
  wordList?: WordListKey;
}

const SIGN_OFF_LINES = {
  low: ["Nice warm-up.", "Getting the rhythm down.", "Good first run."],
  mid: ["Solid run.", "Your fingers are warming up.", "Nice reflexes out there."],
  high: ["Outstanding reflexes!", "That was sharp.", "Lightning fingers."],
};

function getSignOff(score: number) {
  const pool = score < 400 ? SIGN_OFF_LINES.low : score < 1200 ? SIGN_OFF_LINES.mid : SIGN_OFF_LINES.high;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Destroyed and missed blocks used to play the exact same exit animation —
// identical visual feedback for opposite outcomes. They're deliberately
// different now: a kill pops (quick scale-up flash), a miss drops through
// and tumbles with a red tint.
function blockAnimation(status: "falling" | "destroyed" | "missed") {
  switch (status) {
    case "destroyed":
      return {
        animate: { scale: [1, 1.32, 0.6], opacity: [1, 1, 0] },
        transition: { duration: BLOCK_DEFENSE.destroyAnimMs / 1000, ease: "easeOut" as const },
      };
    case "missed":
      return {
        animate: { y: "+=22", rotate: 12, scale: 0.9, opacity: [1, 0.5, 0] },
        transition: { duration: BLOCK_DEFENSE.missAnimMs / 1000, ease: "easeIn" as const },
      };
    default:
      return null;
  }
}

export default function BlockDefenseGame({ wordList = "common" }: BlockDefenseGameProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blockSpeed = useSettingsStore((s) => s.blockSpeed);
  const setBlockSpeed = useSettingsStore((s) => s.setBlockSpeed);
  const resetBlockSpeed = useSettingsStore((s) => s.resetBlockSpeed);

  const {
    blocks,
    buffer,
    lockedId,
    score,
    combo,
    lives,
    maxLives,
    gameOver,
    bursts,
    missFlashAt,
    boostActive,
    reversedActive,
    handleKey,
    handleMiss,
    restart,
  } = useBlockDefenseGame(wordList, blockSpeed);

  const level = 1 + Math.floor(score / 300);
  const signOff = useMemo(() => getSignOff(score), [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);
  const prevLevelRef = useRef(1);

  useEffect(() => {
    if (score === 0) {
      prevLevelRef.current = 1; // restart
      return;
    }
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level;
      setLevelUpToast(level);
      const t = setTimeout(() => setLevelUpToast(null), 1400);
      return () => clearTimeout(t);
    }
  }, [score, level]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxLives }).map((_, i) => {
            const alive = i < lives;
            return (
              <motion.div
                key={i}
                animate={{ scale: alive ? 1 : 0.82, opacity: alive ? 1 : 0.45 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                <Heart
                  size={18}
                  className={clsx(
                    "transition-colors duration-300",
                    alive ? "fill-accent-coral text-accent-coral" : "text-muted-theme"
                  )}
                />
              </motion.div>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <motion.span
              key={combo}
              initial={{ scale: 1.3, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-xs text-accent-coral"
            >
              <Flame size={13} /> x{combo}
            </motion.span>
          )}
          {boostActive && (
            <span className="flex items-center gap-1 text-xs text-accent-amber">
              <Zap size={13} /> 2x score
            </span>
          )}
          {reversedActive && (
            <span className="flex items-center gap-1 text-xs text-accent-magenta">
              <Sparkles size={13} /> mirrored
            </span>
          )}
          <span className="text-xs text-muted-theme">Lv.{level}</span>
          <span className="font-mono text-sm text-accent-amber">{score} pts</span>
        </div>
      </div>

      <div className="flex w-full items-center gap-3">
        <SpeedSlider value={blockSpeed} onChange={setBlockSpeed} onReset={resetBlockSpeed} />

        <div className="relative flex-1 cursor-text" onClick={() => inputRef.current?.focus()}>
          <input
            ref={inputRef}
            autoFocus
            className="absolute h-0 w-0 opacity-0"
            aria-label="Block defence input"
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Backspace" || e.key.length === 1) {
                e.preventDefault();
                handleKey(e.key);
              }
            }}
          />
          <GlassmorphismContainer className="relative h-[26rem] w-full overflow-hidden">
            <div className="absolute bottom-12 left-0 right-0 border-t-2 border-dashed border-[color-mix(in_srgb,var(--accent-coral)_40%,transparent)]" />
            <span className="absolute bottom-12 right-3 translate-y-5 text-[10px] uppercase tracking-wide text-accent-coral">
              kill line
            </span>

            <AnimatePresence>
              {blocks.map((block) => {
                // The fall is linear, so the moment a near-miss warning should
                // start is just (total time − 1s) before the block reaches the
                // kill line — a pure-CSS animation-delay achieves this without
                // any per-frame JS tracking.
                const warningDelay = Math.max(0, block.fallDuration - 1);
                const resolved = blockAnimation(block.status);

                return (
                  <motion.div
                    key={block.id}
                    initial={{ y: BLOCK_DEFENSE.startY }}
                    animate={resolved ? resolved.animate : { y: BLOCK_DEFENSE.killY }}
                    transition={
                      resolved ? resolved.transition : { duration: block.fallDuration, ease: "linear" }
                    }
                    onAnimationComplete={() => {
                      if (block.status === "falling") handleMiss(block.id);
                    }}
                    style={{ left: `${block.x}%`, top: 0 }}
                    className="absolute"
                  >
                    <div className="relative">
                      {block.status === "falling" && (
                        <div
                          className="absolute -inset-1.5 animate-danger-pulse rounded-lg bg-[color-mix(in_srgb,var(--accent-coral)_40%,transparent)] opacity-0"
                          style={{ animationDelay: `${warningDelay}s` }}
                          aria-hidden
                        />
                      )}
                      <div
                        className={clsx(
                          "glass-panel relative rounded-lg border px-3 py-1.5 font-mono text-sm shadow-glass transition-colors",
                          block.id === lockedId && "shadow-glow-amber",
                          block.status === "missed" && "border-accent-coral bg-[color-mix(in_srgb,var(--accent-coral)_10%,transparent)]",
                          block.status !== "missed" && block.type === "power" && "border-amber/60",
                          block.status !== "missed" &&
                            block.type === "debuff" &&
                            "border-accent-magenta",
                          block.status !== "missed" &&
                            block.type === "normal" &&
                            "border-[var(--glass-border)]"
                        )}
                      >
                        {(reversedActive ? block.word.split("").reverse().join("") : block.word)
                          .split("")
                          .map((ch, i) => {
                            const isTyped = block.id === lockedId && i < buffer.length;
                            return (
                              <span
                                key={i}
                                className={
                                  isTyped ? "text-accent-amber" : "text-[color:var(--text-primary)]"
                                }
                              >
                                {ch}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <AnimatePresence>
              {bursts.map((burst) => (
                <div key={burst.id} className="absolute" style={{ left: `${burst.x}%`, top: burst.y }}>
                  <motion.div
                    initial={{ opacity: 1, scale: 0.4 }}
                    animate={{ opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-teal/50 blur-md"
                  />
                  {burst.angles.map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const dx = Math.cos(rad) * 24;
                    const dy = Math.sin(rad) * 24;
                    return (
                      <motion.span
                        key={i}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 0, x: dx, y: dy, scale: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-amber"
                      />
                    );
                  })}
                </div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {missFlashAt && (
                <motion.div
                  key={missFlashAt}
                  initial={{ opacity: 0.45 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 z-20 bg-[color-mix(in_srgb,var(--accent-coral)_25%,transparent)]"
                  aria-hidden
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {levelUpToast !== null && (
                <motion.div
                  key={levelUpToast}
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--accent-teal)_15%,transparent)] px-4 py-1.5 text-sm font-medium text-accent-teal"
                >
                  <TrendingUp size={14} />
                  Level {levelUpToast}
                </motion.div>
              )}
            </AnimatePresence>

            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-midnight-deep/70 backdrop-blur-sm"
              >
                <p className="font-display text-2xl font-semibold">Game over</p>
                <p className="text-sm text-muted-theme">{signOff}</p>
                <p className="font-mono text-accent-amber">
                  {score} points · Level {level}
                </p>
                <button
                  onClick={() => {
                    restart();
                    inputRef.current?.focus();
                  }}
                  className="glass-panel glass-panel-hover flex items-center gap-2 rounded-full px-5 py-2 text-sm"
                >
                  <RotateCcw size={14} /> Play again
                </button>
              </motion.div>
            )}
          </GlassmorphismContainer>
        </div>
      </div>

      <p className="text-center text-xs text-muted-theme">
        Type the falling words before they cross the kill line. Amber blocks double your score,
        magenta blocks mirror the text for a few seconds. Drag the speed bar to set your own pace.
      </p>
    </div>
  );
}
