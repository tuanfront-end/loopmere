"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";

import { SoundCard } from "./sound-card";

import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSoundStore } from "@/stores/sound";

import type { Sounds } from "@/data/types";

const DEFAULT_VISIBLE_SOUNDS = 9;

interface SoundGridProps {
  functional: boolean;
  id: string;
  sounds: Sounds;
}

export function SoundGrid({ functional, id, sounds }: SoundGridProps) {
  const [showAll, setShowAll] = useLocalStorage(`${id}-show-more`, false);
  const selections = useSoundStore((state) => state.sounds);

  const overflow = useMemo(
    () => sounds.slice(DEFAULT_VISIBLE_SOUNDS),
    [sounds],
  );

  /**
   * A collapsed row can hide a sound that is currently playing, so the toggle
   * says how many rather than leaving the row looking inert.
   */
  const hiddenPlaying = useMemo(
    () =>
      showAll
        ? 0
        : overflow.filter((sound) => selections[sound.id]?.isSelected).length,
    [showAll, overflow, selections],
  );

  return (
    <div>
      {/* Sized against the centre column, not the window: with a rail on
          each side the viewport stopped being what decides this. */}
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {sounds.map((sound, index) => (
          <SoundCard
            key={sound.id}
            {...sound}
            functional={functional}
            hidden={!showAll && index >= DEFAULT_VISIBLE_SOUNDS}
          />
        ))}
      </div>

      {sounds.length > DEFAULT_VISIBLE_SOUNDS && (
        <div className="mt-8 flex justify-center">
          {/* A chip rather than an outline, and the large size rather than
              the small one: this is the one control in a shelf of eighty
              cards, and at `sm` in `outline` it read as a footnote to the
              row above it. Solid brand only when the collapse is hiding
              something that is currently sounding — that is a state worth
              a primary, and the rest of the time it is not. */}
          <Button
            size="lg"
            variant={hiddenPlaying ? "default" : "chip"}
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll
              ? "Show fewer"
              : hiddenPlaying
                ? `Show ${overflow.length} more · ${hiddenPlaying} playing`
                : `Show ${overflow.length} more`}
            {showAll ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      )}
    </div>
  );
}
