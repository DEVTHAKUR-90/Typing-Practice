"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CharSnapshot,
  Difficulty,
  TestMode,
  TestResult,
  WordListKey,
  WordSnapshot,
  WpmSample,
} from "@/types";
import { generateWords } from "@/lib/utils";

export interface EngineConfig {
  mode: TestMode;
  duration: number;
  wordCount: number;
  wordList: WordListKey;
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
  capitalization: boolean;
  customText: string;
}

// Zen/Time mode word lists and the WPM history both grow without limit for
// the life of a long session (extendWords() keeps appending, the 1s ticker
// keeps sampling). Left unbounded, a multi-minute Zen session would keep
// every word and DOM node it ever rendered, plus an ever-growing history
// array re-walked on every render. These cap both: words behind the cursor
// beyond a generous buffer (still far more than the backspace-into-previous-
// word feature ever needs) get dropped, and history keeps only recent samples.
const KEEP_WORDS_BEHIND = 40;
const PRUNE_TRIGGER = 80;
const MAX_HISTORY_SAMPLES = 300; // 5 minutes at 1 sample/sec

interface EvalResult {
  chars: CharSnapshot[];
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export function evaluateWord(target: string, typed: string): EvalResult {
  const chars: CharSnapshot[] = [];
  let correct = 0,
    incorrect = 0,
    extra = 0,
    missed = 0;
  const maxLen = Math.max(target.length, typed.length);
  for (let i = 0; i < maxLen; i++) {
    const t = target[i];
    const c = typed[i];
    if (t === undefined) {
      chars.push({ char: c, state: "extra" });
      extra++;
    } else if (c === undefined) {
      chars.push({ char: t, state: "pending" });
      missed++;
    } else if (c === t) {
      chars.push({ char: c, state: "correct" });
      correct++;
    } else {
      chars.push({ char: c, state: "incorrect" });
      incorrect++;
    }
  }
  return { chars, correct, incorrect, extra, missed };
}

function buildInitialWords(config: EngineConfig): string[] {
  if (config.mode === "custom") {
    return config.customText.trim().length
      ? config.customText.trim().split(/\s+/)
      : ["paste", "your", "text", "in", "settings"];
  }
  const count = config.mode === "words" ? config.wordCount : 60;
  return generateWords({
    wordList: config.wordList,
    count,
    difficulty: config.difficulty,
    punctuation: config.punctuation,
    numbers: config.numbers,
    capitalization: config.capitalization,
  });
}

export function useTypingEngine(config: EngineConfig) {
  const [words, setWords] = useState<WordSnapshot[]>(() =>
    buildInitialWords(config).map((w) => ({ target: w, chars: [], typed: "", done: false }))
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<WpmSample[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);

  const startRef = useRef<number | null>(null);
  const totalsRef = useRef({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const computeWpm = useCallback((seconds: number) => {
    const minutes = Math.max(seconds / 60, 1 / 60);
    const { correct, incorrect, extra } = totalsRef.current;
    const wpm = Math.round(correct / 5 / minutes);
    const rawWpm = Math.round((correct + incorrect + extra) / 5 / minutes);
    const totalTyped = correct + incorrect;
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;
    return { wpm, rawWpm, accuracy };
  }, []);

  const finish = useCallback(() => {
    setStatus((s) => {
      if (s === "finished") return s;
      return "finished";
    });
  }, []);

  // finalize once status flips to finished
  useEffect(() => {
    if (status !== "finished") return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    // fold the in-progress word into totals if it has any input
    if (currentInput.length > 0) {
      const evalRes = evaluateWord(words[currentWordIndex]?.target ?? "", currentInput);
      totalsRef.current.correct += evalRes.correct;
      totalsRef.current.incorrect += evalRes.incorrect;
      totalsRef.current.extra += evalRes.extra;
    }

    const seconds = startRef.current ? (Date.now() - startRef.current) / 1000 : 0;
    const { wpm, rawWpm, accuracy } = computeWpm(seconds || 1);
    const t = totalsRef.current;

    const finalResult: TestResult = {
      wpm,
      rawWpm,
      accuracy,
      cps: seconds > 0 ? Math.round((t.correct / seconds) * 10) / 10 : 0,
      duration: Math.round(seconds),
      correctChars: t.correct,
      incorrectChars: t.incorrect,
      missedChars: t.missed,
      extraChars: t.extra,
      history,
      difficultWords: words
        .filter((w) => w.chars.some((c) => c.state === "incorrect"))
        .map((w) => w.target)
        .slice(0, 10),
      mode: configRef.current.mode,
      timestamp: Date.now(),
    };
    setResult(finalResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const start = useCallback(() => {
    startRef.current = Date.now();
    setStatus("running");
    intervalRef.current = setInterval(() => {
      const seconds = (Date.now() - (startRef.current ?? Date.now())) / 1000;
      setElapsed(seconds);
      const { wpm, rawWpm, accuracy } = computeWpm(seconds);
      setHistory((h) => [...h, { time: Math.round(seconds), wpm, rawWpm, accuracy }].slice(-MAX_HISTORY_SAMPLES));

      if (configRef.current.mode === "time" && seconds >= configRef.current.duration) {
        finish();
      }
    }, 1000);
  }, [computeWpm, finish]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startRef.current = null;
    totalsRef.current = { correct: 0, incorrect: 0, extra: 0, missed: 0 };
    setElapsed(0);
    setHistory([]);
    setResult(null);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setStatus("idle");
    setWords(
      buildInitialWords(configRef.current).map((w) => ({
        target: w,
        chars: [],
        typed: "",
        done: false,
      }))
    );
  }, []);

  const extendWords = useCallback(() => {
    setWords((prev) => {
      const more = generateWords({
        wordList: configRef.current.wordList,
        count: 40,
        difficulty: configRef.current.difficulty,
        punctuation: configRef.current.punctuation,
        numbers: configRef.current.numbers,
        capitalization: configRef.current.capitalization,
      });
      return [...prev, ...more.map((w) => ({ target: w, chars: [], typed: "", done: false }))];
    });
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (status === "finished") return;
      if (status === "idle") {
        if (key === "Backspace" || key.length !== 1) return;
        start();
      }

      if (key === "Backspace") {
        if (currentInput.length > 0) {
          setCurrentInput((s) => s.slice(0, -1));
          return;
        }
        // Caught up to the start of the current word: hop back into the
        // previous word so a typo can still be fixed, reversing its counted
        // stats so they don't get double-applied when it's re-submitted.
        const prevIndex = currentWordIndex - 1;
        const prevWord = words[prevIndex];
        if (prevIndex < 0 || !prevWord?.done) return;

        if (prevWord.counts) {
          totalsRef.current.correct -= prevWord.counts.correct;
          totalsRef.current.incorrect -= prevWord.counts.incorrect;
          totalsRef.current.extra -= prevWord.counts.extra;
          totalsRef.current.missed -= prevWord.counts.missed;
        }
        setWords((prev) => {
          const next = [...prev];
          next[prevIndex] = { ...next[prevIndex], done: false, chars: [], counts: undefined };
          return next;
        });
        setCurrentWordIndex(prevIndex);
        setCurrentInput(prevWord.typed);
        return;
      }

      if (key === " ") {
        if (currentInput.length === 0) return;

        const target = words[currentWordIndex]?.target ?? "";
        const evalRes = evaluateWord(target, currentInput);
        totalsRef.current.correct += evalRes.correct;
        totalsRef.current.incorrect += evalRes.incorrect;
        totalsRef.current.extra += evalRes.extra;
        totalsRef.current.missed += evalRes.missed;

        const isLastWord = currentWordIndex === words.length - 1;
        const finiteMode = configRef.current.mode === "words" || configRef.current.mode === "custom";

        // Only Time/Zen ever run long enough to need this — Words/Custom
        // mode have a fixed, bounded word count already.
        const pruneCount =
          !finiteMode && currentWordIndex + 1 > PRUNE_TRIGGER
            ? currentWordIndex + 1 - KEEP_WORDS_BEHIND
            : 0;

        setWords((prev) => {
          const next = [...prev];
          next[currentWordIndex] = {
            ...next[currentWordIndex],
            chars: evalRes.chars,
            typed: currentInput,
            done: true,
            counts: {
              correct: evalRes.correct,
              incorrect: evalRes.incorrect,
              extra: evalRes.extra,
              missed: evalRes.missed,
            },
          };
          return pruneCount > 0 ? next.slice(pruneCount) : next;
        });

        if (isLastWord) {
          if (finiteMode) {
            finish();
          } else {
            extendWords();
          }
        }

        setCurrentWordIndex((i) => i + 1 - pruneCount);
        setCurrentInput("");
        return;
      }

      if (key.length === 1) {
        setCurrentInput((s) => s + key);
      }
    },
    [status, start, words, currentWordIndex, currentInput, finish, extendWords]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const timeLeft = Math.max(0, Math.round(configRef.current.duration - elapsed));
  const live = computeWpm(Math.max(elapsed, 0.1));

  return {
    words,
    currentWordIndex,
    currentInput,
    status,
    elapsed,
    timeLeft,
    history,
    result,
    liveWpm: live.wpm,
    liveAccuracy: live.accuracy,
    handleKey,
    reset,
    finish,
  };
}
