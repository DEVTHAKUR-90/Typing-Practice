"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "./settingsStore";
import { useHistoryStore } from "./historyStore";

/**
 * Stores use `skipHydration` so the server-rendered markup and the client's
 * very first render both use the same default state (avoiding a React
 * hydration mismatch). This hook performs the actual localStorage read right
 * after mount and reports back once it's done, so callers can defer
 * rendering anything that depends on persisted state until it's safe.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    useHistoryStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
