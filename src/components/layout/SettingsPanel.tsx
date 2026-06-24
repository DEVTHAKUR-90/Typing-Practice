"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { WordListKey, ThemeKey } from "@/types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORD_LISTS: { key: WordListKey; label: string }[] = [
  { key: "common", label: "Common words" },
  { key: "programming", label: "Programming terms" },
  { key: "quotes", label: "Quotes" },
];

const THEMES: { key: ThemeKey; label: string }[] = [
  { key: "aurora", label: "Aurora (dark)" },
  { key: "daybreak", label: "Daybreak (light)" },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const wordList = useSettingsStore((s) => s.wordList);
  const setWordList = useSettingsStore((s) => s.setWordList);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);
  const punctuation = useSettingsStore((s) => s.punctuation);
  const togglePunctuation = useSettingsStore((s) => s.togglePunctuation);
  const numbers = useSettingsStore((s) => s.numbers);
  const toggleNumbers = useSettingsStore((s) => s.toggleNumbers);
  const capitalization = useSettingsStore((s) => s.capitalization);
  const toggleCapitalization = useSettingsStore((s) => s.toggleCapitalization);
  const customText = useSettingsStore((s) => s.customText);
  const setCustomText = useSettingsStore((s) => s.setCustomText);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const mode = useSettingsStore((s) => s.mode);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="glass-panel fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto p-6 shadow-glass"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="glass-panel-hover rounded-full p-1.5 text-muted-theme"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <Section title="Theme">
              <div className="flex flex-col gap-2">
                {THEMES.map((t) => (
                  <OptionRow
                    key={t.key}
                    label={t.label}
                    active={theme === t.key}
                    onClick={() => setTheme(t.key)}
                    groupId="theme-dot"
                  />
                ))}
              </div>
            </Section>

            <Section title="Word list">
              <div className="flex flex-col gap-2">
                {WORD_LISTS.map((w) => (
                  <OptionRow
                    key={w.key}
                    label={w.label}
                    active={wordList === w.key}
                    onClick={() => setWordList(w.key)}
                    groupId="wordlist-dot"
                  />
                ))}
              </div>
            </Section>

            <Section title="Difficulty">
              <div className="flex gap-2">
                <Pill
                  label="Normal"
                  active={difficulty === "normal"}
                  onClick={() => setDifficulty("normal")}
                />
                <Pill
                  label="Advanced"
                  active={difficulty === "advanced"}
                  onClick={() => setDifficulty("advanced")}
                />
              </div>
              <p className="mt-2 text-xs text-muted-theme">
                Advanced mode allows symbols and digits to appear in generated words.
              </p>
            </Section>

            <Section title="Toggles">
              <div className="flex flex-col gap-2">
                <Toggle label="Punctuation" checked={punctuation} onChange={togglePunctuation} />
                <Toggle label="Numbers" checked={numbers} onChange={toggleNumbers} />
                <Toggle
                  label="Capitalization"
                  checked={capitalization}
                  onChange={toggleCapitalization}
                />
              </div>
            </Section>

            {mode === "custom" && (
              <Section title="Custom text">
                <CustomTextField customText={customText} setCustomText={setCustomText} />
              </Section>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-theme">{title}</p>
      {children}
    </div>
  );
}

function CustomTextField({
  customText,
  setCustomText,
}: {
  customText: string;
  setCustomText: (text: string) => void;
}) {
  // Typing here used to call the global store setter on every keystroke,
  // which (since the typing engine remounts whenever customText changes)
  // was rebuilding the entire test engine on every character. We keep a
  // local draft and only commit to the store after a short pause or on
  // blur, so the engine only rebuilds once you've actually stopped typing.
  const [draft, setDraft] = useState(customText);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => setDraft(customText), [customText]);

  const commit = (value: string) => {
    if (value !== customText) setCustomText(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commit(value), 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <textarea
      value={draft}
      onChange={handleChange}
      onBlur={(e) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        commit(e.target.value);
      }}
      placeholder="Paste the text you want to practice typing..."
      rows={6}
      className="w-full resize-none rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-sm font-mono outline-none placeholder:text-muted-theme focus:border-[color:var(--accent-teal)] transition-colors"
    />
  );
}

function OptionRow({
  label,
  active,
  onClick,
  groupId,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  groupId: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors glass-panel-hover",
        active ? "border border-accent-teal text-accent-teal" : "border border-transparent"
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId={groupId}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="h-1.5 w-1.5 rounded-full bg-accent-teal"
        />
      )}
    </button>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 overflow-hidden rounded-lg glass-panel glass-panel-hover px-3 py-2 text-sm transition-colors"
    >
      {active && (
        <motion.span
          layoutId="difficulty-pill"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-0 bg-[color:var(--accent-teal)]"
        />
      )}
      <span className={clsx("relative z-10", active ? "text-midnight-deep" : "text-muted-theme")}>
        {label}
      </span>
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm glass-panel-hover"
    >
      <span>{label}</span>
      <span
        className={clsx(
          "relative h-5 w-9 rounded-full transition-colors duration-300",
          checked ? "bg-[color:var(--accent-teal)]" : "bg-[var(--glass-border)]"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </span>
    </button>
  );
}
