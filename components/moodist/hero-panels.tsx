"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { SoundIcon } from "./sound-icon";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";
import { useSoundStore } from "@/stores/sound";

const SHELL = "bg-card/90 shadow-soft-lg rounded-md p-4 backdrop-blur sm:p-5";

/**
 * Three mixes somebody already made, because the hardest thing about a page of
 * eighty-four loops is the first click.
 *
 * This replaced a panel that drew the six sounds currently picked as a grid of
 * tiles. That one only ever restated what the panel on the other side of the
 * photograph already said, and on an empty page — which is every first visit —
 * it said nothing at all. A door is worth more than a mirror.
 */
const STARTERS: Array<{ label: string; sounds: Record<string, number> }> = [
  {
    label: "Rainy study",
    sounds: { cafe: 0.25, keyboard: 0.3, "light-rain": 0.6 },
  },
  {
    label: "Deep forest",
    sounds: { campfire: 0.3, river: 0.4, "wind-in-trees": 0.5 },
  },
  {
    label: "Night train",
    sounds: { clock: 0.2, "inside-a-train": 0.55, "rain-on-window": 0.4 },
  },
];

/** The ids a starter holds, in one order, so two mixes can be compared. */
const signature = (ids: Array<string>) => [...ids].sort().join();

export function HeroStarters() {
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const isPlaying = useSoundStore((state) => state.isPlaying);

  /** A string rather than an array: the selector runs on every store write. */
  const picked = useSoundStore((state) =>
    signature(
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );

  const running = useMemo(
    () =>
      STARTERS.find(
        (starter) => signature(Object.keys(starter.sounds)) === picked,
      )?.label ?? null,
    [picked],
  );

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">Start here</p>

      <p className="mt-1 text-lg font-medium tracking-tight">
        Three made earlier
      </p>

      <ul className="mt-3 flex flex-col gap-1">
        {STARTERS.map((starter) => {
          const active = starter.label === running;
          const sounding = active && isPlaying;

          return (
            <li key={starter.label}>
              {/* The row is the transport once it is the mix that is on. A
                  play triangle that stays a play triangle while the thing it
                  started is audible is the control lying about the state it
                  is in — so it turns over, and the click stops meaning "load
                  this" and starts meaning "pause this". */}
              <button
                aria-label={
                  sounding
                    ? `Pause ${starter.label}`
                    : active
                      ? `Play ${starter.label} again`
                      : `Play ${starter.label}, a mix of ${Object.keys(starter.sounds).length} loops`
                }
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm p-2.5 text-left transition-colors",
                  active
                    ? "bg-chip text-primary-ink"
                    : "hover:bg-accent text-foreground",
                )}
                onClick={() => {
                  if (active) {
                    togglePlay();
                    return;
                  }

                  override(starter.sounds);
                  play();
                }}
              >
                <span aria-hidden="true" className="flex shrink-0 gap-0.5">
                  {Object.keys(starter.sounds).map((id) => (
                    <SoundIcon id={id} key={id} size={20} />
                  ))}
                </span>

                <span className="truncate text-sm font-medium">
                  {starter.label}
                </span>

                {sounding ? (
                  <PauseIcon
                    aria-hidden="true"
                    className="ml-auto size-3.5 shrink-0"
                  />
                ) : (
                  <PlayIcon
                    aria-hidden="true"
                    className={cn(
                      "ml-auto size-3.5 shrink-0",
                      !active && "text-muted-foreground",
                    )}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The shelf you build yourself.
 *
 * This slot held the transport and a readout of the global level, which is the
 * pair the right rail already draws with room to label properly — two panels
 * saying the same thing across one photograph. Favourites is the one part of
 * the product nothing else on this screen reports, and it takes the
 * reference's shape without arguing: a number that grows, a bar under it, and
 * a way in.
 */
export function HeroFavourites() {
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));

  const total = count();
  const share = (favorites.length / total) * 100;

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">Saved</p>

      <p className="mt-1 text-2xl tracking-tight tabular-nums">
        {favorites.length} of {total}
      </p>

      <p className="mt-4 text-sm font-medium">Your own shelf</p>

      <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
        {/* Floored at 2% once there is anything at all: one loop out of
            eighty-four is a tenth of a pixel, and a bar that reads as empty
            when it is not is worse than no bar. */}
        <div
          className="bg-primary h-full rounded-full transition-[width]"
          style={{ width: `${favorites.length ? Math.max(share, 2) : 0}%` }}
        />
      </div>

      <div className="text-muted-foreground mt-2 flex items-baseline justify-between text-xs tabular-nums">
        <span>0</span>
        <span>{total}</span>
      </div>

      <div className="border-border mt-4 flex items-center gap-3 border-t pt-3">
        <p className="text-muted-foreground text-xs text-balance">
          Tap a heart on any card.
        </p>

        <a
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "ml-auto shrink-0",
          )}
          href="#category-favorites"
        >
          See them
        </a>
      </div>
    </div>
  );
}
