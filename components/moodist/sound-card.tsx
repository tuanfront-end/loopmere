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
        "group/sound relative cursor-pointer rounded-lg p-5 transition-all",
        // Resting: a hairline, because a white card on this page is a whisper.
        "bg-card border",
        // One hover for both states, and it goes *up*: back to white, with the
        // hairline traded for a soft cast. Nothing here darkens on hover —
        // one rung down is `bg-muted`, which is exactly what the volume track
        // and the two corner buttons are drawn in, so a card that sank took
        // all three with it.
        "hover:bg-card hover:border-transparent hover:shadow-soft",
        // Playing: the tint alone holds the state, and the cast stays the
        // hover's. A resting card here carries a hairline, never a shadow.
        isSelected && "bg-accent border-transparent",
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
            // drawn to sit in, and without it the render floats loose.
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
