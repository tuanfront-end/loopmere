"use client";

import { useEffect } from "react";

import { useNoteStore } from "@/stores/note";
import { usePresetStore } from "@/stores/preset";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";
import { useTodoStore } from "@/stores/todo";

/** Hydration is once per page load, not once per mount. */
let hydrated = false;

/**
 * All stores persist with `skipHydration`, so nothing reads localStorage until
 * this effect runs on the client. That is what keeps the server-rendered markup
 * and the first client render identical.
 *
 * Strict Mode mounts this twice in development, and the second pass used to
 * rehydrate stores that were already hydrated — which doubled every persisted
 * list until `mergePersisted` stopped arrays from concatenating. That fix
 * makes a second pass harmless; the guard makes sure there is none.
 */
export function StoreConsumer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hydrated) return;

    hydrated = true;

    useSoundStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useNoteStore.persist.rehydrate();
    usePresetStore.persist.rehydrate();
    useTodoStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
