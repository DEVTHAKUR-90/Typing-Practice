"use client";

import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RotateCcw, Trophy } from "lucide-react";
import { TestResult } from "@/types";
import GlassmorphismContainer from "@/components/layout/GlassmorphismContainer";
import { useHistoryStore } from "@/lib/stores/historyStore";

interface StatsDashboardProps {
  result: TestResult;
  target: number;
  onRestart: () => void;
}

const metricMeta = [
  { key: "wpm", label: "WPM", suffix: "" },
  { key: "accuracy", label: "Accuracy", suffix: "%" },
  { key: "rawWpm", label: "Raw WPM", suffix: "" },
  { key: "duration", label: "Time", suffix: "s" },
] as const;

export default function StatsDashboard({ result, target, onRestart }: StatsDashboardProps) {
  const bests = useHistoryStore((s) => s.bests);
  const best = bests.find((b) => b.mode === result.mode && b.target === target);
  // addResult() stamps the best entry with the result's own timestamp the
  // moment it becomes (or ties) the record, so matching on that tells us
  // whether *this* run is the one currently holding the personal best,
  // without having to thread an extra flag through the engine.
  const isNewBest = !!best && best.timestamp === result.timestamp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex w-full max-w-3xl flex-col gap-6"
    >
      {isNewBest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mx-auto flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent-amber)_15%,transparent)] px-4 py-1.5 text-sm font-medium text-accent-amber"
        >
          <Trophy size={15} />
          New personal best!
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metricMeta.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <GlassmorphismContainer className="flex flex-col items-center gap-1 px-4 py-5">
              <span className="font-mono text-3xl font-semibold text-accent-amber">
                {result[m.key]}
                <span className="text-base text-muted-theme">{m.suffix}</span>
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-theme">{m.label}</span>
              {m.key === "wpm" && best && !isNewBest && (
                <span className="text-[11px] text-muted-theme">best {best.wpm}</span>
              )}
            </GlassmorphismContainer>
          </motion.div>
        ))}
      </div>

      <GlassmorphismContainer className="h-56 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.history.length ? result.history : [{ time: 0, wpm: result.wpm, accuracy: result.accuracy }]}>
            <CartesianGrid stroke="var(--glass-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickFormatter={(v) => `${v}s`}
              stroke="var(--glass-border)"
            />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--glass-border)" />
            <Tooltip
              contentStyle={{
                background: "var(--bg-base)",
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="wpm" stroke="var(--accent-teal)" strokeWidth={2} dot={false} name="WPM" />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="var(--accent-magenta)"
              strokeWidth={2}
              dot={false}
              name="Accuracy"
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassmorphismContainer>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Breakdown label="Correct" value={result.correctChars} colorClass="text-accent-teal" />
        <Breakdown label="Incorrect" value={result.incorrectChars} colorClass="text-accent-coral" />
        <Breakdown label="Missed" value={result.missedChars} colorClass="text-accent-magenta" />
        <Breakdown label="Extra" value={result.extraChars} colorClass="text-accent-amber" />
      </div>

      {result.difficultWords.length > 0 && (
        <GlassmorphismContainer className="p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-theme">
            Words to practice
          </p>
          <div className="flex flex-wrap gap-2 font-mono text-sm">
            {result.difficultWords.map((w, i) => (
              <span key={i} className="rounded-md bg-coral/10 px-2 py-1 text-accent-coral">
                {w}
              </span>
            ))}
          </div>
        </GlassmorphismContainer>
      )}

      <button
        onClick={onRestart}
        className="glass-panel glass-panel-hover mx-auto flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors hover:text-accent-amber"
      >
        <RotateCcw size={15} />
        Try again
      </button>
    </motion.div>
  );
}

function Breakdown({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <GlassmorphismContainer className="flex flex-col items-center gap-1 px-3 py-4">
      <span className={`font-mono text-xl font-semibold ${colorClass}`}>{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-muted-theme">{label}</span>
    </GlassmorphismContainer>
  );
}
