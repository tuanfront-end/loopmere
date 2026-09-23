'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mergePersisted } from '@/lib/persist';

interface SettingsStore {
  alarmVolume: number;
  globalVolume: number;
  setAlarmVolume: (volume: number) => void;
  setGlobalVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      // 90, not 100. Full is the top of the slider, so a mix that arrives
      // there has nowhere to go but down — and an alarm at full over a mix at
      // full is the loudest thing this app can do to somebody who has fallen
      // asleep wearing headphones.
      alarmVolume: 0.9,
      globalVolume: 0.9,

      setAlarmVolume(volume: number) {
        set({ alarmVolume: volume });
      },

      setGlobalVolume(volume: number) {
        set({ globalVolume: volume });
      },
    }),
    {
      merge: mergePersisted,

      /**
       * Changing a default reaches nobody who already has storage, and after
       * a day of use that is everybody. Version 0 shipped both levels at 1,
       * so the page came up at 90 and snapped back to 100 the moment
       * `rehydrate()` ran.
       *
       * A stored 1 cannot be told apart from a chosen 1 — v0 recorded the
       * number and not whether anyone had touched the slider — so this moves
       * both. The cost lands on people who deliberately set full volume, and
       * it is one drag to put back.
       */
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SettingsStore>;

        if (version === 0) {
          return {
            ...state,
            alarmVolume: state.alarmVolume === 1 ? 0.9 : state.alarmVolume,
            globalVolume: state.globalVolume === 1 ? 0.9 : state.globalVolume,
          } as SettingsStore;
        }

        return state as SettingsStore;
      },

      name: 'moodist-settings',
      partialize: state => ({
        alarmVolume: state.alarmVolume,
        globalVolume: state.globalVolume,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);