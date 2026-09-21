"use client";

import { Slider } from "@/components/ui/slider";
import { useSoundStore } from "@/stores/sound";

interface VolumeSliderProps {
  id: string;
  label: string;
}

export function VolumeSlider({ id, label }: VolumeSliderProps) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const isSelected = useSoundStore((state) => state.sounds[id].isSelected);
  const setVolume = useSoundStore((state) => state.setVolume);

  if (!isSelected) return null;

  return (
    <Slider
      aria-label={`${label} volume`}
      className="mt-3 w-full"
      max={1}
      min={0}
      step={0.01}
      value={[volume]}
      // The card underneath toggles the sound; dragging must not reach it.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onValueChange={([next]) => setVolume(id, next)}
    />
  );
}
