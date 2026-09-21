"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { sounds } from "@/data/sounds";
import { useSoundStore } from "@/stores/sound";

/**
 * The hero's overlay is the product doing its job, not the headline restated:
 * it reads the same store the grid writes to.
 */
export function NowPlaying() {
  const selected = useSoundStore(
    useShallow((state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );
  const isPlaying = useSoundStore((state) => state.isPlaying);

  const labels = useMemo(() => {
    const all = sounds.categories.flatMap((category) => category.sounds);

    return selected
      .map((id) => all.find((sound) => sound.id === id)?.label)
      .filter(Boolean) as Array<string>;
  }, [selected]);

  if (!labels.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing picked yet. Tap a card below and it starts.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium">
        {isPlaying ? "Playing now" : "Paused"}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {labels.slice(0, 3).join(", ")}
        {labels.length > 3 && ` and ${labels.length - 3} more`}
      </p>
    </div>
  );
}
