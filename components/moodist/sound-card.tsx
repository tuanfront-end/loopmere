"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo } from "react";

import { useIconSet } from "@/components/dev/icon-set";

import { FavoriteButton } from "./favorite-button";
import { SoundIcon } from "./sound-icon";
import { VolumeSlider } from "./volume-slider";

import { useKeyboardButton } from "@/hooks/use-keyboard-button";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { useLoadingStore } from "@/stores/loading";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

import { thiingsIcons } from "@/data/sound-thiings";

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
  const locked = useSoundStore((state) => state.locked);

  const volume = useSoundStore((state) => state.sounds[id].volume);
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const adjustedVolume = useMemo(
    () => volume * globalVolume,
    [volume, globalVolume],
  );

  const isLoading = useLoadingStore((state) => state.loaders[src]);
  const { set: iconSet } = useIconSet();

  // The 3D set is a kit: the objects share a material and a light angle, so
  // they hold together on their own and a disc behind them reads as a frame.
  const drawsDisc = iconSet === "phosphor" || !thiingsIcons[id];

  const sound = useSound(src, { loop: true, volume: adjustedVolume });

  useEffect(() => {
    if (locked) return;

    if (isSelected && isPlaying && functional) sound?.play();
    else sound?.pause();
  }, [isSelected, sound, isPlaying, functional, locked]);

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
        "group/sound relative cursor-pointer rounded-lg p-5 transition-colors",
        // Resting: a hairline, because a white card on this page is a whisper.
        "bg-card border",
        "hover:bg-accent hover:border-transparent",
        // Playing: the tint holds the state, so hover moves the ink instead.
        isSelected && "bg-accent border-transparent hover:bg-muted",
        hidden && "hidden",
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <FavoriteButton id={id} label={label} />

      <div
        aria-hidden="true"
        className={cn(
          "grid size-11 place-items-center rounded-full transition-colors",
          drawsDisc &&
            (isSelected
              ? "bg-chip text-primary-ink"
              : "bg-muted text-muted-foreground group-hover/sound:bg-transparent"),
        )}
      >
        {isLoading ? (
          <HugeiconsIcon
            className="size-[18px] animate-spin"
            icon={Loading03Icon}
            strokeWidth={1.5}
          />
        ) : (
          <SoundIcon id={id} size={drawsDisc ? 20 : 22} />
        )}
      </div>

      <div className="mt-4 pr-8 text-sm font-medium">{label}</div>

      <VolumeSlider id={id} label={label} />
    </div>
  );
}
