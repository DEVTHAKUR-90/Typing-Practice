/** Shared option lists and tunables, kept in one place instead of scattered
 * magic numbers across components. */

export const TEST_DURATIONS = [15, 30, 60, 120] as const;
export const TEST_WORD_COUNTS = [10, 25, 50, 100] as const;

export const DEFAULT_DURATION = 30;
export const DEFAULT_WORD_COUNT = 25;

export const BLOCK_DEFENSE = {
  startingLives: 3,
  boostMs: 6000,
  reverseMs: 4000,
  minSpawnIntervalMs: 600,
  baseSpawnIntervalMs: 1700,
  // ms shaved off the spawn interval per score point. Tuned so max spawn
  // rate is reached around score ~1800 (roughly a minute or two of decent
  // play) instead of within the first half-dozen kills.
  spawnDifficultyRate: 0.6,
  minFallSeconds: 3.2,
  baseFallSeconds: 7,
  // seconds shaved off the fall duration per score point — same gentler
  // ramp, reaching max fall speed around score ~1500.
  fallDifficultyRate: 0.0025,
  // Game area is h-[26rem] (416px). Blocks travel on a pixel y-axis (via
  // transform, not top/left) from just above the visible area down to the
  // kill line, which sits at bottom-12 (48px from the bottom).
  startY: -40,
  killY: 356,
  // Spawn x-range as a percentage of container width, kept well clear of
  // the right edge so longer words (up to 7 chars) don't get clipped by the
  // container's overflow-hidden on narrow viewports.
  minSpawnXPercent: 8,
  maxSpawnXPercent: 58,
  // Manual speed slider — a multiplier the player drags themselves, applied
  // on top of the automatic score-based ramp above. 1x changes nothing;
  // 2x roughly doubles fall/spawn speed, 0.5x roughly halves it.
  minSpeed: 0.5,
  maxSpeed: 2,
  defaultSpeed: 1,
  // How long the destroy/miss exit effects play before the block is
  // actually removed from state. Shared by the hook (cleanup timeout) and
  // the component (animation duration) so they can't drift out of sync.
  destroyAnimMs: 420,
  missAnimMs: 460,
} as const;
