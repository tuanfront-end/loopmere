'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * A value kept in localStorage, read with `useSyncExternalStore` rather than
 * copied into state — the same shape as the theme in `theme-provider.tsx`.
 *
 * The copy was the bug. It read the stored value in one effect and wrote the
 * current one in another, and on mount the current one was still the
 * fallback: the write landed on top of what was saved. Strict Mode runs
 * effects twice in development, so the second read found the fallback and
 * kept it — every load reset the Pomodoro lengths and every shelf's Show more.
 * Read from the source, nothing is written until somebody sets something.
 *
 * `getServerSnapshot` answers null, so the server and the first client render
 * both see the fallback and agree.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab writing the same key; this tab's own writes arrive below.
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * What this tab has written, for when localStorage refuses the write — storage
 * blocked, quota full. The snapshot is read back from storage, so without this
 * a refused write would not apply at all, not even until the tab closes.
 */
const memory = new Map<string, string>();

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * @param key - The key the value is stored under in localStorage.
 * @param fallback - The value until one is stored. Pass something stable — a
 * primitive or a memoised object — since it is what the hook returns then.
 */
export function useLocalStorage<T>(key: string, fallback: T): [T, SetValue<T>] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(() => parse(raw, fallback), [raw, fallback]);

  const setValue = useCallback<SetValue<T>>(
    next => {
      const resolved =
        typeof next === 'function'
          ? (next as (previous: T) => T)(parse(read(key), fallback))
          : next;

      const serialised = JSON.stringify(resolved);

      memory.set(key, serialised);

      try {
        localStorage.setItem(key, serialised);
      } catch {
        // `memory` holds it for this tab.
      }

      listeners.forEach(listener => listener());
    },
    [key, fallback],
  );

  return [value, setValue];
}
