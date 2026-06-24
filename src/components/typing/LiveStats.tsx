"use client";

import { TestMode } from "@/types";
import { formatTime } from "@/lib/utils";

interface LiveStatsProps {
  mode: TestMode;
  timeLeft: number;
  elapsed: number;
  wordsRemaining: number;
  liveWpm: number;
  liveAccuracy: number;
  status: "idle" | "running" | "finished";
}

export default function LiveStats({
  mode,
  timeLeft,
  elapsed,
  wordsRemaining,
  liveWpm,
  liveAccuracy,
  status,
}: LiveStatsProps) {
  return (
    <div className="flex items-center justify-center gap-6 font-mono text-sm text-muted-theme">
      <span className="text-accent-amber">
        {mode === "time"
          ? formatTime(timeLeft)
          : mode === "words" || mode === "custom"
            ? `${wordsRemaining} left`
            : formatTime(elapsed)}
      </span>
      {status === "running" && (
        <>
          <span>{liveWpm} wpm</span>
          <span>{liveAccuracy}% acc</span>
        </>
      )}
    </div>
  );
}
