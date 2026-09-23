"use client";

import { Slider } from "@/components/ui/slider";
import { useSoundStore } from "@/stores/sound";
import { PERCENT } from "@/components/ui/slider";

interface VolumeSliderProps {
  /** Not in the mix: the rail is drawn, but it is nobody's control yet. */
  disabled?: boolean;
  id: string;
  label: string;
}

/**
 * The card decides whether this is drawn and reserves the row either way, so
 * there is no `isSelected` guard here and no margin of its own — both used to
 * live here, and between them a pick changed the card's height.
 */
export function VolumeSlider({ disabled, id, label }: VolumeSliderProps) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const setVolume = useSoundStore((state) => state.setVolume);

  return (
    <Slider
      format={PERCENT}
      aria-label={`${label} level`}
      disabled={disabled}
      max={1}
      min={0}
      step={0.01}
      value={[volume]}
      onValueChange={(next) =>
        setVolume(id, Array.isArray(next) ? next[0] : next)
      }
    />
  );
}
