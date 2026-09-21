"use client";

import { Slider } from "@/components/ui/slider";
import { useSoundStore } from "@/stores/sound";

interface VolumeSliderProps {
  id: string;
  label: string;
}

/**
 * The card decides whether this is drawn and reserves the row either way, so
 * there is no `isSelected` guard here and no margin of its own — both used to
 * live here, and between them a pick changed the card's height.
 */
export function VolumeSlider({ id, label }: VolumeSliderProps) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const setVolume = useSoundStore((state) => state.setVolume);

  return (
    <Slider
      aria-label={`${label} level`}
      max={1}
      min={0}
      step={0.01}
      value={[volume]}
      // The card underneath toggles the sound; a drag must not reach it.
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onValueChange={(next) =>
        setVolume(id, Array.isArray(next) ? next[0] : next)
      }
    />
  );
}
