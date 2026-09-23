"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sounds as soundCategories } from "@/data/sounds";
import { pickMany, random } from "@/helpers/random";
import { mergePersisted } from "@/lib/persist";

type SoundValue = {
  isFavorite: boolean;
  /**
   * In the mix but silent. Separate from `isSelected` so a sound can be
   * quietened without leaving the mix and losing the level it was set to,
   * and separate from the store's global `isPlaying`, which stops everything.
   */
  isPaused: boolean;
  isSelected: boolean;
  volume: number;
};

interface SoundStore {
  getFavorites: () => Array<string>;
  history: Record<string, SoundValue> | null;
  isPlaying: boolean;
  lock: () => void;
  locked: boolean;
  noSelected: () => boolean;
  override: (sounds: Record<string, number>) => void;
  pause: () => void;
  play: () => void;
  restoreHistory: () => void;
  select: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  shuffle: () => void;
  sounds: Record<string, SoundValue>;
  toggleFavorite: (id: string) => void;
  togglePause: (id: string) => void;
  togglePlay: () => void;
  unlock: () => void;
  unselect: (id: string) => void;
  unselectAll: (pushToHistory?: boolean) => void;
}

function createInitialSounds() {
  const initialSounds: Record<string, SoundValue> = {};

  soundCategories.categories.forEach((category) => {
    category.sounds.forEach((sound) => {
      initialSounds[sound.id] = {
        isFavorite: false,
        isPaused: false,
        isSelected: false,
        volume: 0.5,
      };
    });
  });

  return initialSounds;
}

/**
 * Every sound out of the mix, unpaused and back at the default level — as a new
 * object with new entries. The three bulk actions used to write these fields
 * into the objects already in the store and hand `set` the same record back,
 * so anything subscribed to `state.sounds` as a whole never heard: after
 * "Build me a mix", Send this mix still shared the empty mix from before.
 */
function cleared(sounds: Record<string, SoundValue>) {
  return Object.fromEntries(
    Object.entries(sounds).map(([id, sound]) => [
      id,
      { ...sound, isPaused: false, isSelected: false, volume: 0.5 },
    ]),
  );
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      getFavorites() {
        const { sounds } = get();
        const ids = Object.keys(sounds);
        const favorites = ids.filter((id) => sounds[id].isFavorite);

        return favorites;
      },

      history: null,
      isPlaying: false,

      lock() {
        set({ locked: true });
      },

      locked: false,

      noSelected() {
        const { sounds } = get();
        const keys = Object.keys(sounds);

        return keys.every((key) => !sounds[key].isSelected);
      },

      override(newSounds) {
        get().unselectAll();

        const current = get().sounds;
        const sounds = { ...current };

        Object.keys(newSounds).forEach((id) => {
          if (current[id]) {
            sounds[id] = {
              ...current[id],
              isPaused: false,
              isSelected: true,
              volume: newSounds[id],
            };
          }
        });

        set({ history: null, sounds });
      },

      pause() {
        set({ isPlaying: false });
      },

      play() {
        set({ isPlaying: true });
      },

      restoreHistory() {
        const history = get().history;

        if (!history) return;

        set({ history: null, sounds: history });
      },

      select(id) {
        const sound = get().sounds[id];

        set({
          history: null,
          sounds: {
            ...get().sounds,
            [id]: {
              ...sound,
              // Adding a sound back always sounds: a pause it carried from its
              // last time in the mix would be a silent card nobody asked for,
              // and so would a level someone had dragged to nought before
              // taking it out — taking it out no longer resets that level.
              isPaused: false,
              isSelected: true,
              volume: sound.volume > 0 ? sound.volume : 0.5,
            },
          },
        });
      },

      setVolume(id, volume) {
        set({
          sounds: {
            ...get().sounds,
            [id]: { ...get().sounds[id], volume },
          },
        });
      },

      shuffle() {
        const sounds = cleared(get().sounds);

        pickMany(Object.keys(sounds), 4).forEach((id) => {
          sounds[id] = { ...sounds[id], isSelected: true, volume: random(0.2, 1) };
        });

        set({ history: null, isPlaying: true, sounds });
      },

      sounds: createInitialSounds(),

      toggleFavorite(id) {
        const sounds = get().sounds;
        const sound = sounds[id];

        set({
          history: null,
          sounds: {
            ...sounds,
            [id]: { ...sound, isFavorite: !sound.isFavorite },
          },
        });
      },

      togglePause(id) {
        const sounds = get().sounds;
        const sound = sounds[id];

        set({
          sounds: { ...sounds, [id]: { ...sound, isPaused: !sound.isPaused } },
        });
      },

      togglePlay() {
        set({ isPlaying: !get().isPlaying });
      },

      unlock() {
        set({ locked: false });
      },

      unselect(id) {
        set({
          sounds: {
            ...get().sounds,
            [id]: { ...get().sounds[id], isSelected: false },
          },
        });
      },

      unselectAll(pushToHistory = false) {
        const noSelected = get().noSelected();

        if (noSelected) return;

        const sounds = get().sounds;

        if (pushToHistory) {
          const history = JSON.parse(JSON.stringify(sounds));
          set({ history });
        }

        set({ sounds: cleared(sounds) });
      },
    }),
    {
      merge: mergePersisted,
      name: "moodist-sounds",
      partialize: (state) => ({
        sounds: state.sounds,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 0,
    },
  ),
);
