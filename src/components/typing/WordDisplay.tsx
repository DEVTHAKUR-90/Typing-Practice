"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { WordSnapshot } from "@/types";
import { evaluateWord } from "@/lib/hooks/useTypingEngine";

interface WordDisplayProps {
  words: WordSnapshot[];
  currentWordIndex: number;
  currentInput: string;
  status: "idle" | "running" | "finished";
  onKeyStroke: (key: string) => void;
}

function charClass(state: string) {
  switch (state) {
    case "correct":
      return "text-[color:var(--text-primary)]";
    case "incorrect":
      return "text-accent-coral";
    case "extra":
      return "text-accent-coral line-through";
    case "pending":
    default:
      return "text-muted-theme";
  }
}

const IDLE_HINTS = [
  "Click here and start typing to begin",
  "Start typing whenever you're ready",
  "Your first keystroke starts the clock",
];

// Already-typed and not-yet-reached words never change once rendered (their
// WordSnapshot object reference stays stable across renders — the engine
// only replaces the one index that actually changed), so memoizing them
// means a keystroke in the active word only re-renders that one word
// instead of diffing the whole stream every time. This matters most for
// Time/Words-100/Zen sessions where dozens of words are on screen.
const InactiveWord = memo(function InactiveWord({ word }: { word: WordSnapshot }) {
  const chars = word.chars.length ? word.chars : null;
  const hasError = word.done && word.chars.some((c) => c.state === "incorrect");

  return (
    <span className={clsx("mr-3 inline-block", hasError && "border-b-2 border-accent-coral")}>
      {chars
        ? chars.map((c, ci) => (
            <span key={ci} className={charClass(c.state)}>
              {c.char}
            </span>
          ))
        : word.target.split("").map((ch, ci) => (
            <span key={ci} className="text-muted-theme">
              {ch}
            </span>
          ))}
    </span>
  );
});

export default function WordDisplay({
  words,
  currentWordIndex,
  currentInput,
  status,
  onKeyStroke,
}: WordDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lineOffset, setLineOffset] = useState(0);
  const [idleHint] = useState(() => IDLE_HINTS[Math.floor(Math.random() * IDLE_HINTS.length)]);

  // Smoothly shift the word stream up by exactly one text-line at a time,
  // instead of relying on native scrolling (which doesn't work inside an
  // overflow-hidden viewport, and previously left the active word invisible).
  // This also has to re-run while typing *within* the active word, not just
  // when it changes: extra/overtyped characters can grow the word wide
  // enough to wrap onto a new line, which would otherwise desync the offset
  // until the next space press.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const active = activeWordRef.current;
      if (!wrapper || !active) return;

      const wordEls = Array.from(wrapper.children) as HTMLElement[];
      if (wordEls.length < 2) return;

      const firstTop = wordEls[0].offsetTop;
      const secondLineEl = wordEls.find((el) => el.offsetTop > firstTop);
      const lineHeight = secondLineEl ? secondLineEl.offsetTop - firstTop : 0;
      if (!lineHeight) return;

      const activeRow = Math.round((active.offsetTop - firstTop) / lineHeight);
      // Keep one line of context above the active line once we've scrolled past it.
      const targetRow = Math.max(0, activeRow - 1);
      setLineOffset(targetRow * lineHeight);
    });
    return () => cancelAnimationFrame(raf);
  }, [currentWordIndex, words.length, currentInput.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status === "finished") return;
    if (e.key === " " || e.key === "Backspace") {
      e.preventDefault();
      onKeyStroke(e.key);
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onKeyStroke(e.key);
    }
  };

  const liveEval = evaluateWord(words[currentWordIndex]?.target ?? "", currentInput);
  const lastTypedState =
    currentInput.length > 0 ? liveEval.chars[currentInput.length - 1]?.state : null;

  return (
    <div className="relative w-full cursor-text" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        autoFocus
        className="absolute h-0 w-0 opacity-0"
        onKeyDown={handleKeyDown}
        aria-label="Typing input"
      />
      <div className="h-[7.5rem] overflow-hidden sm:h-[9.75rem]">
        <motion.div
          ref={wrapperRef}
          animate={{ y: -lineOffset }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide"
        >
          {words.map((word, wi) => {
            if (wi !== currentWordIndex) {
              return <InactiveWord key={wi} word={word} />;
            }

            return (
              <span key={wi} ref={activeWordRef} className="relative mr-3 inline-block">
                {liveEval.chars.map((c, ci) => (
                  <span key={ci} className="relative">
                    {ci === currentInput.length && (
                      <motion.span
                        layoutId="typing-caret"
                        transition={{ type: "spring", stiffness: 480, damping: 30 }}
                        className="absolute -left-[1px] top-0 h-[1.15em] w-[2px] animate-caret-pulse bg-accent-amber shadow-glow-amber"
                        aria-hidden
                      />
                    )}
                    <motion.span
                      animate={c.state === "incorrect" ? { x: [0, -2, 2, 0] } : { x: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className={clsx("inline-block transition-colors duration-150", charClass(c.state))}
                    >
                      {c.char}
                    </motion.span>
                  </span>
                ))}
                {currentInput.length === liveEval.chars.length && (
                  <motion.span
                    layoutId="typing-caret"
                    transition={{ type: "spring", stiffness: 480, damping: 30 }}
                    className="absolute -right-[1px] top-0 h-[1.15em] w-[2px] animate-caret-pulse bg-accent-amber shadow-glow-amber"
                    aria-hidden
                  />
                )}
                {lastTypedState === "incorrect" && (
                  <span
                    key={currentInput.length}
                    className="pointer-events-none absolute inset-0 -m-1 rounded animate-crack-flash bg-[color-mix(in_srgb,var(--accent-coral)_20%,transparent)]"
                    aria-hidden
                  />
                )}
              </span>
            );
          })}
        </motion.div>
      </div>

      {status === "idle" && (
        <p className="mt-3 text-center text-xs text-muted-theme">{idleHint}</p>
      )}
    </div>
  );
}
