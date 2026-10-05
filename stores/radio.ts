'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mergePersisted, uniqueById } from '@/lib/persist';

export interface Station {
  channel: string;
  /** The YouTube video id, which is also what makes a station a duplicate. */
  id: string;
  title: string;
}

interface RadioStore {
  addStation: (station: Station) => void;
  removeStation: (id: string) => void;
  /** The listener's own, newest first. The built-in ones live in the panel. */
  stations: Array<Station>;
}

export const useRadioStore = create<RadioStore>()(
  persist(
    (set, get) => ({
      addStation(station) {
        set({ stations: uniqueById([station, ...get().stations]) });
      },

      removeStation(id) {
        set({ stations: get().stations.filter(station => station.id !== id) });
      },

      stations: [],
    }),
    {
      merge: mergePersisted,
      name: 'loopmere-radio',
      partialize: state => ({ stations: state.stations }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
