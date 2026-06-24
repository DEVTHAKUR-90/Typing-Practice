"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import { BLOCK_DEFENSE } from "@/lib/constants";

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
}

const { minSpeed, maxSpeed, defaultSpeed } = BLOCK_DEFENSE;
const TRACK_HEIGHT = 144; // px

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function SpeedSlider({ value, onChange, onReset }: SpeedSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const percent = (value - minSpeed) / (maxSpeed - minSpeed); // 0 (slow) .. 1 (fast)

  const valueFromClientY = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    // Top of the track = max speed, bottom = min speed — dragging up increases.
    const fraction = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    const raw = minSpeed + fraction * (maxSpeed - minSpeed);
    return Math.round(raw * 10) / 10;
  };

  const updateFromPointer = (e: React.PointerEvent) => {
    onChange(valueFromClientY(e.clientY));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromPointer(e);
  };

  const endDrag = () => setDragging(false);

  const isDefault = Math.abs(value - defaultSpeed) < 0.05;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-theme">Speed</span>
      <div
        ref={trackRef}
        role="slider"
        aria-label="Block fall speed"
        aria-valuemin={minSpeed}
        aria-valuemax={maxSpeed}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onChange(clamp(value + 0.1, minSpeed, maxSpeed));
          if (e.key === "ArrowDown") onChange(clamp(value - 0.1, minSpeed, maxSpeed));
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ height: TRACK_HEIGHT }}
        className="glass-panel relative w-7 cursor-pointer touch-none select-none rounded-full"
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full bg-[color-mix(in_srgb,var(--accent-teal)_25%,transparent)]"
          style={{ height: `${percent * 100}%` }}
        />
        <motion.div
          animate={{ top: `${(1 - percent) * 100}%` }}
          transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
          className="absolute left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--accent-teal)] shadow-glow-amber"
        />
      </div>
      <span className="font-mono text-xs text-accent-amber">{value.toFixed(1)}x</span>
      <button
        onClick={onReset}
        disabled={isDefault}
        aria-label="Reset speed to default"
        title="Reset to default"
        className={clsx(
          "glass-panel-hover rounded-full p-1.5 transition-colors",
          isDefault ? "text-muted-theme/40" : "text-muted-theme hover:text-accent-amber"
        )}
      >
        <RotateCcw size={12} />
      </button>
    </div>
  );
}
