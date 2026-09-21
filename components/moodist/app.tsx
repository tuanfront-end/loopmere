"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Howler } from "howler";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { CategorySection } from "./category-section";
import { PlayControls } from "./play-controls";
import { StoreConsumer } from "./store-consumer";
import { Toolbar } from "./toolbar";

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

  const allCategories = useMemo(() => {
    if (!favoriteSounds.length) return categories;

    return [
      {
        icon: <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />,
        id: "favorites",
        sounds: favoriteSounds,
        title: "Favourites",
      },
      ...categories,
    ];
  }, [favoriteSounds, categories]);

  return (
    <StoreConsumer>
      <PlayControls />

      {allCategories.map((category) => (
        <CategorySection
          key={category.id}
          {...category}
          blurb={categoryBlurbs[category.id]}
          functional={category.id !== "favorites"}
        />
      ))}

      <Toolbar />
    </StoreConsumer>
  );
}
