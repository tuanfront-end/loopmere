"use client";

import { useRef } from "react";

import { PERCENT, Slider } from "@/components/ui/slider";
import { useSoundStore } from "@/stores/sound";

import type { Slider as SliderPrimitive } from "@base-ui/react/slider";

interface VolumeSliderProps {
  id: string;
  label: string;
}

/** Where a touch started, and what it has turned out to be so far. */
interface Gesture {
  x: number;
  y: number;
  /** The page took it as a scroll; nothing it does after that is a level. */
  scrolled: boolean;
  /** It moved sideways far enough to be a drag. */
  sideways: boolean;
  /** The level under the finger when it landed, for a tap that ends there. */
  landed: number | null;
}

/** Sideways travel, in pixels, before a touch counts as a drag. */
const DRAG = 8;

function touches(event: Event | undefined) {
  return (
    (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) ||
    (event instanceof PointerEvent && event.pointerType === "touch")
  );
}

function point(event: Event) {
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
    const touch = event.changedTouches[0];

    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  return event instanceof PointerEvent
    ? { x: event.clientX, y: event.clientY }
    : null;
}

/**
 * Live whether or not the sound is in the mix, and reaching for it is how a
 * sound joins: a press, a drag or an arrow key on a card's slider picks the
 * card and starts the mix, at the level the hand set. It was disabled until
 * the card was picked, which made the one control on the card that looks most
 * like it does something the one that did nothing.
 *
 * A finger is read for what it means before it counts. A phone shows two of
 * these to a row, and a thumb scrolling the shelf lands on one sooner or
 * later: a slider that took every touch would start a sound on every scroll
 * that began there. So out of the mix the rail lets a vertical swipe through
 * to the page — `idle`, in the wrapper — and only a tap, or a drag that goes
 * sideways before it goes anywhere else, picks the card. In the mix every
 * change is a level, the way it always was.
 */
export function VolumeSlider({ id, label }: VolumeSliderProps) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const isSelected = useSoundStore((state) => state.sounds[id].isSelected);
  const select = useSoundStore((state) => state.select);
  const play = useSoundStore((state) => state.play);
  const setVolume = useSoundStore((state) => state.setVolume);

  const gesture = useRef<Gesture | null>(null);

  /** Into the mix at `level`, and the mix on. Read on the call, not subscribed. */
  const join = (level: number) => {
    const { locked, sounds } = useSoundStore.getState();

    if (locked) return;

    if (!sounds[id].isSelected) {
      select(id);
      play();
    }

    setVolume(id, level);
  };

  const onValueChange = (
    next: number | ReadonlyArray<number>,
    details: SliderPrimitive.Root.ChangeEventDetails,
  ) => {
    const level = typeof next === "number" ? next : next[0];

    if (useSoundStore.getState().sounds[id].isSelected) {
      setVolume(id, level);
      return;
    }

    const touch = gesture.current;

    if (touch && touches(details.event)) {
      // Landing sets a level before anyone knows what the touch is. Held for
      // the tap it may turn out to be, and not applied.
      if (details.reason === "track-press") {
        touch.landed = level;
        return;
      }

      if (touch.scrolled) return;

      if (!touch.sideways) {
        const at = point(details.event);
        const dx = at ? Math.abs(at.x - touch.x) : 0;
        const dy = at ? Math.abs(at.y - touch.y) : 0;

        if (dx < DRAG || dy >= dx) return;
        touch.sideways = true;
      }
    }

    join(level);
  };

  return (
    <Slider
      aria-label={`${label} level`}
      format={PERCENT}
      idle={!isSelected}
      max={1}
      min={0}
      step={0.01}
      value={[volume]}
      onClick={() => {
        // A tap on the rail, or a press on the thumb that never moved: the
        // card is picked at the level it landed on, or the one it had.
        const touch = gesture.current;

        if (touch?.scrolled || useSoundStore.getState().sounds[id].isSelected)
          return;

        join(touch?.landed ?? volume);
      }}
      onPointerCancelCapture={() => {
        if (gesture.current) gesture.current.scrolled = true;
      }}
      onPointerDownCapture={(event) => {
        gesture.current =
          event.pointerType === "touch"
            ? {
                landed: null,
                scrolled: false,
                sideways: false,
                x: event.clientX,
                y: event.clientY,
              }
            : null;
      }}
      onValueChange={onValueChange}
    />
  );
}
