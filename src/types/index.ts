export type TestMode = "time" | "words" | "zen" | "custom" | "blocks";

export type WordListKey = "common" | "programming" | "quotes";

export type Difficulty = "normal" | "advanced";

export type ThemeKey = "aurora" | "daybreak";

export interface TestSettings {
  mode: TestMode;
  duration: number; // seconds, for time mode
  wordCount: number; // for words mode
  wordList: WordListKey;
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
  capitalization: boolean;
  customText: string;
  theme: ThemeKey;
  blockSpeed: number; // Block Defence manual speed multiplier
}

export type CharState = "pending" | "correct" | "incorrect" | "extra";

export interface CharSnapshot {
  char: string;
  state: CharState;
}

export interface WordSnapshot {
  target: string;
  chars: CharSnapshot[];
  typed: string;
  done: boolean;
  counts?: { correct: number; incorrect: number; extra: number; missed: number };
}

export interface WpmSample {
  time: number; // seconds elapsed
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  cps: number;
  duration: number;
  correctChars: number;
  incorrectChars: number;
  missedChars: number;
  extraChars: number;
  history: WpmSample[];
  difficultWords: string[];
  mode: TestMode;
  timestamp: number;
}

export interface PersonalBest {
  mode: TestMode;
  target: number; // duration or wordCount
  wpm: number;
  accuracy: number;
  timestamp: number;
}
