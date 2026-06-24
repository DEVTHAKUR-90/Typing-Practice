import { getWordList } from "./wordLists";
import { Difficulty, WordListKey } from "@/types";

const PUNCT_MARKS = [",", ".", "!", "?", ";", ":"];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export interface GenerateOptions {
  wordList: WordListKey;
  count: number;
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
  capitalization: boolean;
}

export function generateWords(opts: GenerateOptions): string[] {
  if (opts.wordList === "quotes") {
    const quotes = getWordList("quotes");
    const words: string[] = [];
    while (words.length < opts.count) {
      const quote = quotes[randomInt(quotes.length)];
      words.push(...quote.split(" "));
    }
    return words.slice(0, opts.count);
  }

  const pool = getWordList(opts.wordList);
  const words: string[] = [];

  for (let i = 0; i < opts.count; i++) {
    let word = pool[randomInt(pool.length)];

    if (opts.numbers && opts.difficulty === "advanced" && randomInt(8) === 0) {
      word = String(randomInt(9999));
    }

    if (opts.capitalization && (i === 0 || randomInt(10) === 0)) {
      word = capitalize(word);
    }

    if (
      opts.punctuation &&
      opts.difficulty === "advanced" &&
      i !== opts.count - 1 &&
      randomInt(6) === 0
    ) {
      word += PUNCT_MARKS[randomInt(PUNCT_MARKS.length)];
    }

    words.push(word);
  }

  if (opts.punctuation && opts.difficulty === "advanced" && words.length > 0) {
    words[words.length - 1] = words[words.length - 1].replace(/[,;:]$/, "") + ".";
  }

  return words;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
