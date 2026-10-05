'use client';

import { create } from 'zustand';

interface RestStore {
  /** When each resting sound plays again, as `Date.now()` time. */
  until: Record<string, number>;
  set: (id: string, until: number | null) => void;
}

/**
 * Which "now and then" sounds are between plays, and until when. Written by
 * the card's player, read by the mix desk, which would otherwise show a sound
 * in the mix, unpaused and silent, with nothing to say it is only waiting.
 * Not persisted: a rest is a timer, and timers do not survive a reload.
 */
export const useRestStore = create<RestStore>()((set, get) => ({
  set(id, until) {
    const next = { ...get().until };

    if (until === null) delete next[id];
    else next[id] = until;

    set({ until: next });
  },

  until: {},
}));
