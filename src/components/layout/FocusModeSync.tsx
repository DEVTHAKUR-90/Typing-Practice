"use client";

import { useEffect } from "react";
import { useFocusModeStore } from "@/lib/stores/focusModeStore";

/**
 * The browser already exits fullscreen on Esc, a system gesture, or the
 * browser's own "exit fullscreen" UI — we don't need to (and shouldn't)
 * write our own Esc handler for that. We just need to know when it
 * happened, from whichever path triggered it, and fold our own
 * decluttered-layout state back in line with reality.
 */
export default function FocusModeSync() {
  const exit = useFocusModeStore((s) => s.exit);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) exit();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [exit]);

  return null;
}
