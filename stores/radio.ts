"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mergePersisted, uniqueById } from "@/lib/persist";

export interface Station {
  channel: string;
  /** The YouTube video id, which is also what makes a station a duplicate. */
  id: string;
  title: string;
}

interface RadioStore {
  /** Loading YouTube was agreed to once, and is not asked again. */
  accept: () => void;
  accepted: boolean;
  addStation: (station: Station) => void;
  /** The station on the player, playing or not; null when it is closed. */
  current: Station | null;
  /** Shrunk to a pill. YouTube does not let a hidden player play. */
  minimised: boolean;
  /** Whether it is meant to be sounding, as opposed to what YouTube reports. */
  playing: boolean;
  removeStation: (id: string) => void;
  setMinimised: (minimised: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  /** The listener's own, newest first. The built-in ones are in `data/stations`. */
  stations: Array<Station>;
  stop: () => void;
  tune: (station: Station) => void;
  /** The radio's own level, 0 to 1, under the Everything slider like a sound's. */
  volume: number;
}

export const useRadioStore = create<RadioStore>()(
  persist(
    (set, get) => ({
      accept() {
        set({ accepted: true });
      },

      accepted: false,

      addStation(station) {
        set({ stations: uniqueById([station, ...get().stations]) });
      },

      current: null,
      minimised: false,
      playing: false,

      removeStation(id) {
        set({
          stations: get().stations.filter((station) => station.id !== id),
        });
      },

      setMinimised(minimised) {
        // Shrinking pauses; opening it again is a request to hear it.
        set({ minimised, playing: !minimised });
      },

      setPlaying(playing) {
        set({ playing });
      },

      setVolume(volume) {
        set({ volume });
      },

      stations: [],

      stop() {
        set({ current: null, minimised: false, playing: false });
      },

      tune(station) {
        set({ current: station, minimised: false, playing: true });
      },

      volume: 0.7,
    }),
    {
      merge: mergePersisted,
      name: "loopmere-radio",
      // The station on the player is not kept: a page that opens with a
      // player on it, paused, is a surprise nobody asked for.
      partialize: (state) => ({
        accepted: state.accepted,
        stations: state.stations,
        volume: state.volume,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
