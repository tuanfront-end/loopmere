"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Build scaffolding, not a feature. It exists so the two icon sets can be
 * judged on the real grid instead of side by side in a folder, and the whole
 * of `components/dev/` comes out before anything ships.
 */
export type IconSet = "phosphor" | "thiings";

const STORAGE_KEY = "moodist-icon-set";

const IconSetContext = createContext<{
  set: IconSet;
  setSet: (next: IconSet) => void;
}>({ set: "phosphor", setSet: () => {} });

export function useIconSet() {
  return useContext(IconSetContext);
}

export function IconSetProvider({ children }: { children: React.ReactNode }) {
  const [set, setSetState] = useState<IconSet>("phosphor");

  // Read after mount: the server has no localStorage, and a pick written into
  // the first render is a hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "phosphor" || saved === "thiings") setSetState(saved);
    } catch {
      // Private mode, blocked storage: the default set is a fine answer.
    }
  }, []);

  const setSet = useCallback((next: IconSet) => {
    setSetState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same as above; the pick just does not survive a reload.
    }
  }, []);

  return (
    <IconSetContext.Provider value={{ set, setSet }}>
      {children}
    </IconSetContext.Provider>
  );
}
