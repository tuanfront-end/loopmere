"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light" | "system";

export const THEME_KEY = "moodist-theme";

/**
 * The theme as external state, read with `useSyncExternalStore` rather than
 * held in React.
 *
 * It genuinely is external: the class is on `<html>` before React exists,
 * written by the blocking script in `layout.tsx` so the first paint is already
 * the right colour. Copying that into `useState` inside an effect would mean a
 * render at the wrong theme followed by a correction — the flash the script is
 * there to prevent, arriving one frame later — and `getServerSnapshot` is what
 * keeps the server and the first client render agreeing.
 */
const listeners = new Set<() => void>();

function query() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

/** The single place the class and `color-scheme` are written. */
export function applyTheme(theme: Theme) {
  const resolved =
    theme === "system" ? (query().matches ? "dark" : "light") : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  // Native controls — scrollbars, date pickers, form widgets — read this and
  // nothing else. Without it they stay light on a dark page.
  document.documentElement.style.colorScheme = resolved;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const media = query();
  const onSystemChange = () => {
    // Only the pages following the system care, and `stored()` is what says so.
    if (stored() === "system") applyTheme("system");
    listeners.forEach((l) => l());
  };

  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
}

function stored(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);

    return value === "dark" || value === "light" ? value : "system";
  } catch {
    // Private mode, or storage blocked. The system preference still works.
    return "system";
  }
}

const getSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/** The server has no `matchMedia` and no storage, so it renders the ground. */
const getServerSnapshot = () => "light" as const;

export function useTheme() {
  const resolved = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setTheme = useCallback((theme: Theme) => {
    try {
      if (theme === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Not being able to remember it does not stop it applying now.
    }

    applyTheme(theme);
    listeners.forEach((l) => l());
  }, []);

  return { resolved, setTheme };
}

/**
 * Runs before the first paint, so the page is never drawn in one theme and
 * repainted in the other. Inline and blocking on purpose — a deferred script
 * would be the flash.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;
