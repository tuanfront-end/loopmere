'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import merge from 'deepmerge';

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
      merge: (persisted, current) =>
        merge(current, persisted as Partial<SettingsStore>),
      name: 'moodist-settings',
      partialize: state => ({
        alarmVolume: state.alarmVolume,
        globalVolume: state.globalVolume,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 0,
    },
  ),
);