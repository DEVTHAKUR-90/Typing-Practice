"use client";

import { motion } from "framer-motion";
import { Settings2, SunMoon } from "lucide-react";
import ModeSelector from "./ModeSelector";
import { useSettingsStore } from "@/lib/stores/settingsStore";

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full flex flex-col items-center gap-6 px-4 pt-8 sm:pt-10"
    >
      <div className="flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
            <path
              d="M11 0L21 7V19L11 26L1 19V7L11 0Z"
              fill="none"
              stroke="var(--accent-teal)"
              strokeWidth="1.4"
            />
            <path d="M11 4V22" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-display text-lg font-semibold tracking-tight">
            Aurora<span className="text-[color:var(--accent-teal)]">Type</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "aurora" ? "daybreak" : "aurora")}
            aria-label="Toggle theme"
            className="glass-panel glass-panel-hover flex h-9 w-9 items-center justify-center rounded-full text-muted-theme transition-colors hover:text-[color:var(--text-primary)]"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex"
            >
              <SunMoon size={16} />
            </motion.span>
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="glass-panel glass-panel-hover flex h-9 w-9 items-center justify-center rounded-full text-muted-theme transition-colors hover:text-[color:var(--text-primary)]"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <ModeSelector />
    </motion.header>
  );
}
