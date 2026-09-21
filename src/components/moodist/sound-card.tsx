"use client";

import { useCallback, useEffect, useMemo } from "react";
import { ImSpinner9 } from "react-icons/im";

import { FavoriteButton } from "./favorite-button";
import { VolumeSlider } from "./volume-slider";

import { useKeyboardButton } from "@/hooks/use-keyboard-button";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { useLoadingStore } from "@/stores/loading";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

import type { Sound as SoundType } from "@/data/types";

interface SoundCardProps extends SoundType {
  /** Cards in the Favorites row mirror the real ones — they must not play twice. */
  functional: boolean;
  hidden: boolean;
}

export function SoundCard({ functional, hidden, icon, id, label, src }: SoundCardProps) {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const play = useSoundStore((state) => state.play);
  const selectSound = useSoundStore((state) => state.select);
  const unselectSound = useSoundStore((state) => state.unselect);
  const setVolume = useSoundStore((state) => state.setVolume);
  const isSelected = useSoundStore((state) => state.sounds[id].isSelected);
  const locked = useSoundStore((state) => state.locked);

  const volume = useSoundStore((state) => state.sounds[id].volume);
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const adjustedVolume = useMemo(() => volume * globalVolume, [volume, globalVolume]);

  const isLoading = useLoadingStore((state) => state.loaders[src]);

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
        "group relative cursor-pointer rounded-xl border p-4 text-left transition-all",
        "bg-card hover:border-foreground/20 hover:shadow-sm",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        isSelected && "border-foreground/30 bg-accent shadow-sm",
        hidden && "hidden",
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <FavoriteButton id={id} label={label} />

      <div
        aria-hidden="true"
        className={cn(
          "text-xl transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {isLoading ? <ImSpinner9 className="animate-spin" /> : icon}
      </div>

      <div className="mt-2 text-sm font-medium">{label}</div>

      <VolumeSlider id={id} label={label} />
    </div>
  );
}
