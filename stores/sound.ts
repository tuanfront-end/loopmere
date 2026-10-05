"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sounds as soundCategories } from "@/data/sounds";
import { pickMany, random } from "@/helpers/random";
import { mergePersisted } from "@/lib/persist";

type SoundValue = {
  isFavorite: boolean;
  /**
   * Plays through, then rests a while before it plays again, rather than
   * looping without a break. Only a sound marked `event` in its data.
   */
  isOccasional: boolean;
  /**
   * In the mix but silent. Separate from `isSelected` so a sound can be
   * quietened without leaving the mix and losing the level it was set to,
   * and separate from the store's global `isPlaying`, which stops everything.
   */
  isPaused: boolean;
  isSelected: boolean;
  /**
   * Its level rises and falls on a slow wave of its own instead of holding
   * still. The level set on the slider is the top of the wave.
   */
  isSwelling: boolean;
  /** Where it sits between the ears: -1 all left, 0 centre, 1 all right. */
  pan: number;
  volume: number;
};

/**
 * What a mix carries besides its levels. Optional, because a preset saved or a
 * link sent before either existed holds levels alone.
 */
export interface MixExtras {
  /** Only the sounds off centre. */
  pan?: Record<string, number>;
  swell?: Array<string>;
}

interface SoundStore {
  getFavorites: () => Array<string>;
  history: Record<string, SoundValue> | null;
  isPlaying: boolean;
  lock: () => void;
  locked: boolean;
  noSelected: () => boolean;
  override: (sounds: Record<string, number>, extras?: MixExtras) => void;
  pause: () => void;
  play: () => void;
  restoreHistory: () => void;
  select: (id: string) => void;
  setPan: (id: string, pan: number) => void;
  setVolume: (id: string, volume: number) => void;
  shuffle: () => void;
  sounds: Record<string, SoundValue>;
  toggleFavorite: (id: string) => void;
  toggleOccasional: (id: string) => void;
  togglePause: (id: string) => void;
  toggleSwell: (id: string) => void;
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
        isOccasional: false,
        isPaused: false,
        isSelected: false,
        isSwelling: false,
        pan: 0,
        volume: 0.5,
      };
    });
  });

  return initialSounds;
}

/**
 * What a mix of `ids` carries besides its levels, read off the store: the
 * sounds that swell, and where the ones off centre sit, to the hundredth.
 */
export function extrasOf(
  sounds: Record<string, SoundValue>,
  ids: Array<string>,
): Required<MixExtras> {
  return {
    pan: Object.fromEntries(
      ids
        .filter((id) => sounds[id].pan !== 0)
        .map((id) => [id, Number(sounds[id].pan.toFixed(2))]),
    ),
    swell: ids.filter((id) => sounds[id].isSwelling),
  };
}

/**
 * Every sound out of the mix, unpaused, holding still, centred and back at the default
 * level — as a new object with new entries. The three bulk actions used to
 * write these fields into the objects already in the store and hand `set` the
 * same record back, so anything subscribed to `state.sounds` as a whole never
 * heard: after "Build me a mix", Send this mix still shared the empty mix from
 * before.
 */
function cleared(sounds: Record<string, SoundValue>) {
  return Object.fromEntries(
    Object.entries(sounds).map(([id, sound]) => [
      id,
      {
        ...sound,
        isOccasional: false,
        isPaused: false,
        isSelected: false,
        isSwelling: false,
        pan: 0,
        volume: 0.5,
      },
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

      override(newSounds, { pan = {}, swell = [] } = {}) {
        get().unselectAll();

        const current = get().sounds;
        const sounds = { ...current };

        // Own keys only: a mix can arrive from a link, and `current.constructor`
        // is truthy on any object, so the check used to let it in as a sound.
        Object.keys(newSounds).forEach((id) => {
          if (Object.hasOwn(current, id)) {
            sounds[id] = {
              ...current[id],
              isPaused: false,
              isSelected: true,
              isSwelling: swell.includes(id),
              pan: pan[id] ?? 0,
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

      setPan(id, pan) {
        set({
          sounds: {
            ...get().sounds,
            [id]: { ...get().sounds[id], pan },
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

      toggleOccasional(id) {
        const sounds = get().sounds;
        const sound = sounds[id];

        set({
          sounds: {
            ...sounds,
            [id]: { ...sound, isOccasional: !sound.isOccasional },
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

      toggleSwell(id) {
        const sounds = get().sounds;
        const sound = sounds[id];

        set({
          sounds: {
            ...sounds,
            [id]: { ...sound, isSwelling: !sound.isSwelling },
          },
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
