import { sounds } from "@/data/sounds";

export interface SoundMatch {
  category: string;
  id: string;
  label: string;
}

/** Lower case and without accents, so "cafe" finds "Café" and back. */
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const index = sounds.categories.flatMap((category) =>
  category.sounds.map((sound) => ({
    category: category.title,
    categoryWords: fold(category.title).split(/\s+/),
    id: sound.id,
    label: sound.label,
    labelText: fold(sound.label),
    labelWords: fold(sound.label).split(/[\s-]+/),
  })),
);

export const SOUND_COUNT = index.length;

/**
 * Every sound the query names, best first. Each word of the query has to start
 * a word of the sound's name or its shelf, so "rain roof" finds Rain on car
 * roof and "rain" brings the whole Rain shelf after the sounds named for it.
 * Starts of words only: matching anywhere inside one had "rain" find Train.
 *
 * Ranked: a name that starts with the query, then names every word of it
 * starts a word of, then sounds found partly or wholly by their shelf. Ties
 * keep page order, which is the order the shelves teach.
 */
export function searchSounds(query: string): Array<SoundMatch> {
  const folded = fold(query).trim();
  const terms = folded.split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  const ranked: Array<{ match: SoundMatch; order: number; rank: number }> = [];

  index.forEach((sound, order) => {
    const inName = (term: string) =>
      sound.labelWords.some((word) => word.startsWith(term));
    const inShelf = (term: string) =>
      sound.categoryWords.some((word) => word.startsWith(term));

    if (!terms.every((term) => inName(term) || inShelf(term))) return;

    let rank = 2;

    if (sound.labelText.startsWith(folded)) rank = 0;
    else if (terms.every(inName)) rank = 1;

    ranked.push({
      match: { category: sound.category, id: sound.id, label: sound.label },
      order,
      rank,
    });
  });

  return ranked
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .map((entry) => entry.match);
}
