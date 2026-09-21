"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo } from "react";

import { FavoriteButton } from "./favorite-button";
import { PauseButton } from "./pause-button";
import { SoundIcon } from "./sound-icon";
import { VolumeSlider } from "./volume-slider";

import { useKeyboardButton } from "@/hooks/use-keyboard-button";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { useLoadingStore } from "@/stores/loading";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

import type { Sound as SoundType } from "@/data/types";

interface SoundCardProps extends SoundType {
  /** Cards in the Favourites row mirror the real ones; they must not play twice. */
  functional: boolean;
  hidden: boolean;
}

export function SoundCard({
  functional,
  hidden,
  id,
  label,
  src,
}: SoundCardProps) {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const play = useSoundStore((state) => state.play);
  const selectSound = useSoundStore((state) => state.select);
  const unselectSound = useSoundStore((state) => state.unselect);
  const setVolume = useSoundStore((state) => state.setVolume);
  const isSelected = useSoundStore((state) => state.sounds[id].isSelected);
  const isPaused = useSoundStore((state) => state.sounds[id].isPaused);
  const locked = useSoundStore((state) => state.locked);

  const volume = useSoundStore((state) => state.sounds[id].volume);
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const adjustedVolume = useMemo(
    () => volume * globalVolume,
    [volume, globalVolume],
  );

  const isLoading = useLoadingStore((state) => state.loaders[src]);

  const sound = useSound(src, { loop: true, volume: adjustedVolume });

  useEffect(() => {
    if (locked) return;

    if (isSelected && isPlaying && !isPaused && functional) sound?.play();
    else sound?.pause();
  }, [isSelected, isPaused, sound, isPlaying, functional, locked]);

  const toggle = useCallback(() => {
    if (locked) return;

    if (isSelected) {
      unselectSound(id);
      setVolume(id, 0.5);
    } else {
      selectSound(id);
      play();
    }
  }, [isSelected, locked, id, selectSound, unselectSound, setVolume, play]);

  const handleKeyDown = useKeyboardButton(toggle);

  return (
    <div
      aria-label={`${label} sound`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "group/sound relative cursor-pointer rounded-lg border p-5 transition-all",
        // Resting takes a hairline, hovering trades it for a cast — the one
        // says sitting on the surface and the other says lifted off it, and
        // the style does not allow both at once.
        "hover:border-transparent hover:shadow-soft",
        // Playing is an outline, not a ground. `bg-accent` measures 1.02
        // against a white card — a whisper, and at a glance across a grid it
        // reads as nothing. A tint loud enough to fix that would be a
        // section-sized fill of brand colour, which is a different rule
        // again; an edge reads at any scale and spends no area.
        //
        // A ring rather than a border, because the hover below takes the
        // border off and the outline is the state, not a resting cue. Two
        // pixels inset, so the card keeps its own footprint.
        "bg-card",
        isSelected && "ring-primary ring-2 ring-inset",
        hidden && "hidden",
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          aria-hidden="true"
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full transition-colors",
            // Never transparent on hover. The disc is the frame the icon was
            // drawn to sit in, and without it the render floats loose. White
            // on a playing card, because the card's own ground is the chip
            // now and a chip disc on a chip ground is no disc at all.
            isSelected
              ? "bg-chip text-primary-ink"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isLoading ? (
            <HugeiconsIcon
              className="size-[18px] animate-spin"
              icon={Loading03Icon}
              strokeWidth={1.5}
            />
          ) : (
            <SoundIcon id={id} />
          )}
        </div>

        <div className="-mt-1.5 -mr-1.5 flex items-center">
          {isSelected && <PauseButton id={id} label={label} />}
          <FavoriteButton id={id} label={label} />
        </div>
      </div>

      <div className="mt-4 text-sm font-medium">{label}</div>

      {/* Always drawn, disabled until the sound is in the mix. It used to
          appear with the pick, so every pick and un-pick changed the card's
          height and shoved the rest of the shelf down a line — and a card
          that showed nothing there gave no hint the level existed. */}
      <div className="mt-4 flex h-6 items-center">
        <VolumeSlider disabled={!isSelected} id={id} label={label} />
      </div>
    </div>
  );
}
