"use client";

import { PlayIcon } from "@heroicons/react/16/solid";
import { useShallow } from "zustand/react/shallow";

import { SoundIcon } from "./sound-icon";

import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

const SHELL = "bg-card/90 shadow-soft-lg rounded-md p-4 backdrop-blur sm:p-5";

/**
 * Three mixes somebody already made, because the hardest thing about a page
 * of eighty-four loops is the first click.
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

export function HeroStarters() {
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">Start here</p>

      <p className="mt-1 text-lg font-medium tracking-tight">
        Three made earlier
      </p>

      <ul className="mt-3 flex flex-col gap-1">
        {STARTERS.map((starter) => (
          <li key={starter.label}>
            <button
              aria-label={`Play ${starter.label}, a mix of ${Object.keys(starter.sounds).length} loops`}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm p-2.5 text-left transition-colors"
              onClick={() => {
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

              <PlayIcon
                aria-hidden="true"
                className="text-muted-foreground ml-auto size-3.5 shrink-0"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The transport and the one level that governs every other one. */
export function HeroLevels() {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const noSelected = useSoundStore((state) => state.noSelected());

  const selected = useSoundStore(
    useShallow(
      (state) =>
        Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected)
          .length,
    ),
  );

  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const percent = Math.round(globalVolume * 100);

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">
        {noSelected ? "Nothing playing" : isPlaying ? "Playing now" : "Paused"}
      </p>

      <p className="mt-1 text-2xl tracking-tight tabular-nums">
        {selected} {selected === 1 ? "loop" : "loops"}
      </p>

      <p className="mt-4 text-sm font-medium">Everything</p>

      {/* A readout, not a control: the rail and the Levels panel are where
          this is set, and a second slider here would be a third place to
          change one number. */}
      <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-muted-foreground mt-2 flex items-baseline justify-between text-xs tabular-nums">
        <span>0</span>
        <span>{percent}%</span>
      </div>

      {/* Four words and a bare label. The reference gives this row a 393px
          card; at the width the centre column actually has, the sentence that
          was here ran to three lines and shouldered the button off the end of
          them. */}
      <div className="border-border mt-4 flex items-center gap-3 border-t pt-3">
        <p className="text-muted-foreground text-xs text-balance">
          Saved in this browser.
        </p>

        <Button
          aria-label={isPlaying ? "Pause the mix" : "Play the mix"}
          className="ml-auto shrink-0"
          disabled={noSelected}
          size="sm"
          onClick={togglePlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
}
