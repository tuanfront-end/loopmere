"use client";

import { useMemo, useState } from "react";

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

  const overflow = sounds.slice(DEFAULT_VISIBLE_SOUNDS);

  /**
   * A collapsed row can hide a sound that is currently playing. Mark the
   * toggle so the row does not look inert while something inside it is on.
   */
  const hasHiddenSelection = useMemo(
    () => !showAll && overflow.some((sound) => selections[sound.id]?.isSelected),
    [showAll, overflow, selections],
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            variant={hasHiddenSelection ? "default" : "outline"}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </div>
      )}
    </div>
  );
}
