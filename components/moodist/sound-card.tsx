"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo } from "react";

import { FavoriteButton } from "./favorite-button";
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

    // Taking a sound out leaves its level alone, so the card is a real toggle:
    // pick it up again and it comes back where you left it. Resetting to half
    // on the way out is what made a one-sound mute worth a button of its own.
    if (isSelected) unselectSound(id);
    else {
      selectSound(id);
      play();
    }
  }, [isSelected, locked, id, selectSound, unselectSound, play]);

  const handleKeyDown = useKeyboardButton(toggle);

  return (
    <div
      aria-label={`${label} sound`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "group/sound bg-card relative cursor-pointer rounded-lg border p-5",
        // Named rather than `all`: the card animates a colour and a cast, and
        // a blanket transition also puts every layout property on a timer.
        "transition-[border-color,box-shadow]",
        // Hover lifts the card and tints its edge. The tint is the state the
        // click is about to produce, drawn faintly — the same brand hue the
        // ring below uses at full strength, so hovering reads as a preview of
        // picking rather than as a second, unrelated decoration.
        //
        // Edge and cast at once is a wider reading of the depth rule than the
        // rule gives: it allows one cue, and here the shadow is carrying all
        // of the depth while the brand edge is carrying none of it.
        "hover:border-primary/60 hover:shadow-soft",
        // Playing is an outline, not a ground. `bg-accent` measures 1.02
        // against a white card — a whisper, and at a glance across a grid it
        // reads as nothing. A tint loud enough to fix that would be a
        // section-sized fill of brand colour, which is a different rule
        // again; an edge reads at any scale and spends no area.
        //
        // A ring rather than a border, because the border is the hover's and
        // the outline is the state. Two pixels inset, so the card keeps its
        // own footprint.
        isSelected && "ring-primary ring-2 ring-inset",
        hidden && "hidden",
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-2">
        {/* No box around the render. It used to sit in a 44px disc at 26px,
            so with the disc gone the image was still inset nine pixels from
            the card's padding while the label below started at it — the icon
            read as nudged out of line with its own card. */}
        {/* Quietened from the rail, the ring stays — the sound is still in the
            mix — and the card recedes inside it: the render drops to the same
            opacity its row in the rail takes, and the label goes grey. A ring
            with faded contents reads as on but not sounding. Drawing the ring
            itself at a third of its strength was the first attempt and it read
            as a card somebody was hovering, which is the one thing on this
            card that is not a state at all.

            The ink below is the spinner's: the render is a raster, so a colour
            set here never reaches it. */}
        <div
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-opacity",
            isSelected && !isPaused
              ? "text-primary-ink"
              : "text-muted-foreground",
            isSelected && isPaused && "opacity-55",
          )}
        >
          {isLoading ? (
            <HugeiconsIcon
              className="size-8 animate-spin"
              icon={Loading03Icon}
              strokeWidth={1.5}
            />
          ) : (
            <SoundIcon id={id} size={32} />
          )}
        </div>

        {/* One button, always the same one, always in the same place. A pause
            used to appear beside it the moment a card was picked, which shoved
            the heart thirty-six pixels left under whatever pointer was already
            resting on it — and said nothing the card was not saying twice
            over, since the card's own click and the slider's nought both end
            in silence. Quietening without leaving the mix is a mixing-desk
            move and it lives at the mixing desk, in the rail. */}
        <div className="-mt-1.5 -mr-1.5 flex items-center">
          <FavoriteButton id={id} label={label} />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 text-sm font-medium transition-colors",
          isSelected && isPaused && "text-muted-foreground",
        )}
      >
        {label}
      </div>

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
