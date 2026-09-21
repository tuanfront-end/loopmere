"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Howler } from "howler";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { CategoryRail } from "./category-rail";
import { CategorySection } from "./category-section";
import { MediaSession } from "./media-session";
import { SharedMix } from "./modals/shared-mix";
import { PlayControls } from "./play-controls";

import { FADE_OUT } from "@/constants/events";
import { categoryBlurbs } from "@/data/category-blurbs";
import { sounds } from "@/data/sounds";
import { subscribe } from "@/lib/event";
import { useSoundStore } from "@/stores/sound";

import type { Sound } from "@/data/types";

export function App() {
  const categories = useMemo(() => sounds.categories, []);

  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));
  const pause = useSoundStore((state) => state.pause);
  const lock = useSoundStore((state) => state.lock);
  const unlock = useSoundStore((state) => state.unlock);

  const favoriteSounds = useMemo(() => {
    const all = categories
      .flatMap((category) => category.sounds)
      .filter((sound) => favorites.includes(sound.id));

    // Keep the order they were favourited in, not the category order.
    return favorites
      .map((favorite) => all.find((sound) => sound.id === favorite))
      .filter(Boolean) as Array<Sound>;
  }, [favorites, categories]);

  /**
   * Safari suspends the audio context when the tab goes to the background and
   * does not always resume it on its own.
   */
  useEffect(() => {
    const onChange = () => {
      const { ctx } = Howler;

      if (ctx && !document.hidden) {
        setTimeout(() => ctx.resume(), 100);
      }
    };

    document.addEventListener("visibilitychange", onChange, false);

    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  /** The sleep timer fades every sound out, then the store pauses for real. */
  useEffect(() => {
    return subscribe(FADE_OUT, (e: { duration: number }) => {
      lock();

      setTimeout(() => {
        pause();
        unlock();
      }, e.duration);
    });
  }, [pause, lock, unlock]);

  /**
   * Favourites last, and there whether or not anything is in it. The rail
   * reads its highlight off this order, so the shelf that is pinned to the
   * foot of the rail is the shelf at the foot of the page; and a shelf that
   * only exists once it has something in it is a shelf nobody finds out about
   * until they have already used the feature it holds.
   */
  const allCategories = useMemo(
    () => [
      ...categories,
      {
        // 32px, the size `SoundIcon` draws a shelf head at. Left to its own
        // default this glyph came out 24 and sat four pixels above the centre
        // of the title beside it.
        icon: (
          <HugeiconsIcon
            className="size-8"
            icon={FavouriteIcon}
            strokeWidth={1.5}
          />
        ),
        id: "favorites",
        sounds: favoriteSounds,
        title: "Favourites",
      },
    ],
    [favoriteSounds, categories],
  );

  return (
    <>
      <MediaSession />
      <SharedMix />

      {/* Both of these are the left rail's and the right rail's jobs from `xl`
          up, so below that width they are the only place those jobs are done
          and above it they would be a second copy of them. */}
      <div className="contents xl:hidden">
        <CategoryRail />
        <PlayControls />
      </div>

      {allCategories.map((category) => (
        <CategorySection
          key={category.id}
          {...category}
          blurb={categoryBlurbs[category.id]}
          emptyMessage={
            category.id === "favorites"
              ? "No hearts yet. Tap one on any card and the sound turns up here, ready for next time."
              : undefined
          }
          functional={category.id !== "favorites"}
        />
      ))}
    </>
  );
}
