'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { count } from '@/helpers/counter';
import { mergePersisted } from '@/lib/persist';

interface NoteStore {
  characters: () => number;
  clear: () => void;
  history: string | null;
  note: string;
  restore: () => void;
  words: () => number;
  write: (note: string) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      characters() {
        return count(get().note).characters;
      },

      clear() {
        if (!get().note) return;

        set({ history: get().note, note: '' });
      },

      history: null,
      note: '',

      restore() {
        if (!get().history) return;

        // biome-ignore lint/style/noNonNullAssertion: it's guaranteed to be not null
        set({ history: null, note: get().history! });
      },

      words() {
        return count(get().note).words;
      },

      write(note) {
        set({ history: null, note });
      },
    }),
    {
      merge: mergePersisted,
      name: 'moodist-note',
      partialize: state => ({ note: state.note }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 0,
    },
  ),
);