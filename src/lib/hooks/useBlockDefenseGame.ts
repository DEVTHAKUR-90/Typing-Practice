"use client";

import { useEffect, useRef, useState } from "react";
import { COMMON_WORDS, PROGRAMMING_WORDS } from "@/lib/wordLists";
import { BLOCK_DEFENSE } from "@/lib/constants";
import { WordListKey } from "@/types";

export type BlockType = "normal" | "power" | "debuff";
export type BlockStatus = "falling" | "destroyed" | "missed";

export interface Block {
  id: string;
  word: string;
  x: number;
  type: BlockType;
  fallDuration: number;
  spawnTime: number;
  status: BlockStatus;
}

export interface Burst {
  id: string;
  x: number;
  y: number;
  angles: number[];
}

function buildPool(wordList: WordListKey) {
  // "Quotes" is a pool of full sentences, not discrete words — falls back
  // to the common word list rather than silently doing nothing useful here.
  const source = wordList === "programming" ? PROGRAMMING_WORDS : COMMON_WORDS;
  return source.filter((w) => w.length >= 3 && w.length <= 7);
}

export function useBlockDefenseGame(
  wordList: WordListKey = "common",
  speedMultiplier: number = BLOCK_DEFENSE.defaultSpeed
) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [buffer, setBuffer] = useState("");
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState<number>(BLOCK_DEFENSE.startingLives);
  const [gameOver, setGameOver] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [boostUntil, setBoostUntil] = useState<number | null>(null);
  const [reversedUntil, setReversedUntil] = useState<number | null>(null);
  const [missFlashAt, setMissFlashAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const scoreRef = useRef(0);
  const poolRef = useRef(buildPool(wordList));
  // A ref (not state) because changing speed shouldn't reset/restart the
  // spawn-scheduling effect below — it just needs the *next* spawn to read
  // the current value. Already-falling blocks keep the fall duration they
  // were spawned with; only future spawns pick up a speed change.
  const speedRef = useRef(speedMultiplier);
  // Cleanup timeouts (removing a block/burst after its exit animation
  // plays) were previously fire-and-forget — harmless in React 18, but if
  // the component unmounted first they'd still run later for no reason.
  // Tracked here so they can all be cancelled on unmount.
  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  function trackedTimeout(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);
      fn();
    }, ms);
    pendingTimeoutsRef.current.add(id);
    return id;
  }

  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    poolRef.current = buildPool(wordList);
  }, [wordList]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Drives the boost/reversed countdown badges. Only runs while one is
  // actually pending — for most of a game neither is active, so there's no
  // reason to re-render this component 3+ times a second the whole time.
  // Resetting the until-timestamp to null on expiry (rather than just
  // letting `boostActive` go false while the stale timestamp lingers) is
  // what lets this effect notice it's no longer needed and stop itself.
  useEffect(() => {
    if (!boostUntil && !reversedUntil) return;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (boostUntil && current >= boostUntil) setBoostUntil(null);
      if (reversedUntil && current >= reversedUntil) setReversedUntil(null);
    }, 300);
    return () => clearInterval(id);
  }, [boostUntil, reversedUntil]);

  useEffect(() => {
    if (gameOver) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const interval =
        Math.max(
          BLOCK_DEFENSE.minSpawnIntervalMs,
          BLOCK_DEFENSE.baseSpawnIntervalMs - scoreRef.current * BLOCK_DEFENSE.spawnDifficultyRate
        ) / speedRef.current;
      timeoutId = setTimeout(() => {
        spawnBlock();
        schedule();
      }, interval);
    };
    schedule();
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  useEffect(() => {
    if (lives <= 0) setGameOver(true);
  }, [lives]);

  function randomWord() {
    const pool = poolRef.current;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function spawnBlock() {
    const roll = Math.random();
    const type: BlockType = roll < 0.08 ? "power" : roll < 0.16 ? "debuff" : "normal";
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const x =
      BLOCK_DEFENSE.minSpawnXPercent +
      Math.random() * (BLOCK_DEFENSE.maxSpawnXPercent - BLOCK_DEFENSE.minSpawnXPercent);
    const fallDuration =
      Math.max(
        BLOCK_DEFENSE.minFallSeconds,
        BLOCK_DEFENSE.baseFallSeconds - scoreRef.current * BLOCK_DEFENSE.fallDifficultyRate
      ) / speedRef.current;
    setBlocks((prev) => [
      ...prev,
      { id, word: randomWord(), x, type, fallDuration, spawnTime: Date.now(), status: "falling" },
    ]);
  }

  // The fall uses linear easing, so we can recover a block's exact current
  // position from elapsed time without needing per-frame state — used so
  // the destroy burst appears where the block actually was, not hardcoded
  // to the kill line (which is only correct for misses, not kills).
  function currentY(block: Block) {
    const elapsed = (Date.now() - block.spawnTime) / 1000;
    const fraction = Math.min(1, Math.max(0, elapsed / block.fallDuration));
    return BLOCK_DEFENSE.startY + fraction * (BLOCK_DEFENSE.killY - BLOCK_DEFENSE.startY);
  }

  function destroyBlock(block: Block) {
    // Marked "destroyed" first (rather than removed outright) so it can play
    // a distinct pop effect — previously a successful kill and a missed
    // block used the exact same exit animation, which gave identical visual
    // feedback for opposite outcomes. Actually removed from state once that
    // effect has had time to play.
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, status: "destroyed" } : b)));
    trackedTimeout(() => {
      setBlocks((prev) => prev.filter((b) => b.id !== block.id));
    }, BLOCK_DEFENSE.destroyAnimMs);

    const boosted = !!boostUntil && Date.now() < boostUntil;
    // Combo bonus: +5% per consecutive kill without a miss, capped at +50%.
    const comboMultiplier = 1 + Math.min(combo, 10) * 0.05;
    const points = Math.round(block.word.length * 10 * (boosted ? 2 : 1) * comboMultiplier);
    setScore((s) => s + points);
    setCombo((c) => c + 1);

    const burstId = `${block.id}-burst`;
    const angles = Array.from({ length: 6 }, () => Math.random() * 360);
    setBursts((prev) => [...prev, { id: burstId, x: block.x, y: currentY(block), angles }]);
    trackedTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== burstId)), 500);

    if (block.type === "power") setBoostUntil(Date.now() + BLOCK_DEFENSE.boostMs);
    if (block.type === "debuff") setReversedUntil(Date.now() + BLOCK_DEFENSE.reverseMs);
  }

  // Called when a block's fall animation completes without being destroyed.
  // Reads `blocks` directly from this render's closure rather than nesting
  // setLives inside setBlocks's updater — nesting a setter inside another
  // setter's updater function gets double-invoked by React Strict Mode in
  // development, which was silently costing two lives per miss instead of one.
  function handleMiss(id: string) {
    if (gameOver) return;
    const block = blocks.find((b) => b.id === id);
    if (!block || block.status !== "falling") return;

    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, status: "missed" } : b)));
    trackedTimeout(() => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }, BLOCK_DEFENSE.missAnimMs);

    setLives((l) => Math.max(0, l - 1));
    setCombo(0);
    setMissFlashAt(Date.now());
  }

  function handleKey(key: string) {
    if (gameOver) return;
    const fallingBlocks = blocks.filter((b) => b.status === "falling");

    if (key === "Backspace") {
      const next = buffer.slice(0, -1);
      setBuffer(next);
      if (next.length === 0) setLockedId(null);
      return;
    }

    if (key.length !== 1) return;
    const candidate = (buffer + key).toLowerCase();
    const target = lockedId
      ? fallingBlocks.find((b) => b.id === lockedId)
      : fallingBlocks.find((b) => b.word.toLowerCase().startsWith(candidate));

    if (!target || !target.word.toLowerCase().startsWith(candidate)) {
      setBuffer("");
      setLockedId(null);
      return;
    }

    setLockedId(target.id);
    if (target.word.toLowerCase() === candidate) {
      destroyBlock(target);
      setBuffer("");
      setLockedId(null);
    } else {
      setBuffer(candidate);
    }
  }

  function restart() {
    setBlocks([]);
    setBuffer("");
    setLockedId(null);
    setScore(0);
    setCombo(0);
    setLives(BLOCK_DEFENSE.startingLives);
    setGameOver(false);
    setBoostUntil(null);
    setReversedUntil(null);
    scoreRef.current = 0;
  }

  return {
    blocks,
    buffer,
    lockedId,
    score,
    combo,
    lives,
    maxLives: BLOCK_DEFENSE.startingLives,
    gameOver,
    bursts,
    missFlashAt,
    boostActive: !!boostUntil && now < boostUntil,
    reversedActive: !!reversedUntil && now < reversedUntil,
    handleKey,
    handleMiss,
    restart,
  };
}
