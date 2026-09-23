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

/* The middle ring of three concentric corners — the hero frame outside it,
   the rows and the button inside — so neither number here is free: the frame
   in `hero.tsx` is `xl` because this is `md`. `p-4` at every width, not the
   sound card's `p-4 sm:p-5`, for the same reason: what sits in a corner bleeds
   by 10, the 6 that leaves plus the rows' 14.4 is 20.4, and the nearest step
   to that is this 19.2. */
const SHELL = "bg-card/90 shadow-soft-lg rounded-md p-4 backdrop-blur";

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

/** The ids a mix holds, in one order, so two mixes can be compared. */
const signature = (ids: Array<string>) => [...ids].sort().join();

/**
 * The mix that is on, as a signature — which both panels match against their
 * own, so each can tell when the thing it starts is the thing playing. A string
 * rather than an array: the selector runs on every store write.
 */
function usePicked() {
  return useSoundStore((state) =>
    signature(
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );
}

export function HeroStarters() {
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const isPlaying = useSoundStore((state) => state.isPlaying);

  const picked = usePicked();

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

          The bottom bleeds too, because the last row's ground sits in the
          card's two lower corners. 6 in on three sides puts its 14.4 corners
          concentric with the card's 19.2, to the nearest step; with the
          card's full padding below it, the lit row sat 6 from the sides and
          16 from the floor, and no corner could run parallel to both.

          Adding `px-2.5` to the labels as well was the first attempt and it
          moved them the other way, 10 past the rows' own text. */}
      <p className="text-muted-foreground text-xs">Start here</p>

      <p className="mt-1 text-lg font-medium tracking-tight">
        Three made earlier
      </p>

      <ul className="-mx-2.5 mt-3 -mb-2.5 flex flex-col gap-1">
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
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const isPlaying = useSoundStore((state) => state.isPlaying);

  /**
   * The mix that is on is the whole shelf — by loops alone, since the button
   * plays each at whatever level it already had. Matched rather than flagged,
   * like the starter rows, so it holds for a shelf switched on by hand too.
   */
  const picked = usePicked();
  const active = favorites.length > 0 && signature(favorites) === picked;
  const sounding = active && isPlaying;

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

      {/* The footer is the pressable part, so it bleeds like the starter
          rows: the button's corners sit 6 inside the card's on three sides.
          The line bleeds with it, so the rule and the button under it are one
          width rather than a short line over a wider bar.

          16 above the line and 16 below it. It was 16 and 12, and a line
          nearer one block reads as that block's underline. */}
      <div className="-mx-2.5 mt-4 -mb-2.5 border-t pt-4">
        <Button
          className="w-full"
          disabled={!favorites.length}
          size="sm"
          onClick={() => {
            // Once the shelf is what is playing, the button is the transport:
            // "Play them all" under a shelf already sounding would be the
            // control lying about its state, the starter rows' rule again.
            if (active) {
              togglePlay();
              return;
            }

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
          {sounding ? <PauseIcon /> : <PlayIcon />}
          {sounding ? "Pause" : "Play them all"}
        </Button>
      </div>
    </div>
  );
}
