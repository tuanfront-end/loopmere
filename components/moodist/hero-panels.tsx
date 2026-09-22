"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { SoundIcon } from "./sound-icon";

import { Button } from "@/components/ui/button";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";
import { useSoundStore } from "@/stores/sound";

const SHELL = "bg-card/90 shadow-soft-lg rounded-md p-4 backdrop-blur sm:p-5";

/** id → label, built once. The panel names sounds it draws no card for. */
const LABELS: Record<string, string> = Object.fromEntries(
  sounds.categories.flatMap((category) =>
    category.sounds.map((sound) => [sound.id, sound.label]),
  ),
);

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
      {/* `-mx-2.5` on the list, and nothing on the two lines above it. The
          row carries its own `p-2.5`, so pulling the list out by exactly that
          lands the row's *text* on the card's padding edge — where these
          labels already are — while the row's hover ground reaches past them
          to the card itself. The rail's rule, in a card: what you read lines
          up, what you press may bleed.

          Adding `px-2.5` to the labels as well was the first attempt and it
          moved them the other way, to 30 against the rows' 20. */}
      <p className="text-muted-foreground text-xs">Start here</p>

      <p className="mt-1 text-lg font-medium tracking-tight">
        Three made earlier
      </p>

      <ul className="-mx-2.5 mt-3 flex flex-col gap-1">
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
 * the product nothing else on this screen reports.
 *
 * The bar that was here is gone. A progress bar says "this is going
 * somewhere", and a shelf is not going anywhere: three saved out of
 * eighty-four is not 4% of a journey, it is three sounds somebody liked. What
 * the room bought is the names of them and a button that plays the lot.
 */
export function HeroFavourites() {
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);

  const named = useMemo(
    () =>
      favorites
        .map((id) => LABELS[id])
        .filter(Boolean)
        .join(", "),
    [favorites],
  );

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">Saved</p>

      <p className="mt-1 text-2xl tracking-tight tabular-nums">
        {favorites.length ? `${favorites.length} of ${count()}` : "None yet"}
      </p>

      <p className="text-muted-foreground mt-3 line-clamp-3 text-sm text-pretty">
        {named ||
          "Tap the heart on any card and the sound lands here, ready for next time."}
      </p>

      <div className="mt-4 border-t pt-3">
        <Button
          className="w-full"
          disabled={!favorites.length}
          size="sm"
          onClick={() => {
            // Read on the click rather than subscribed to: this panel would
            // otherwise re-render on every level anybody drags anywhere.
            const { sounds } = useSoundStore.getState();

            override(
              Object.fromEntries(
                favorites.map((id) => [
                  id,
                  sounds[id].volume > 0 ? sounds[id].volume : 0.5,
                ]),
              ),
            );
            play();
          }}
        >
          <PlayIcon />
          Play them all
        </Button>
      </div>
    </div>
  );
}
