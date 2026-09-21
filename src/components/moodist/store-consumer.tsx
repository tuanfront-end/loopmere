"use client";

import { useEffect } from "react";

import { useNoteStore } from "@/stores/note";
import { usePresetStore } from "@/stores/preset";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";
import { useTodoStore } from "@/stores/todo";

/**
 * All stores persist with `skipHydration`, so nothing reads localStorage until
 * this effect runs on the client. That is what keeps the server-rendered markup
 * and the first client render identical.
 */
export function StoreConsumer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useSoundStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useNoteStore.persist.rehydrate();
    usePresetStore.persist.rehydrate();
    useTodoStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
