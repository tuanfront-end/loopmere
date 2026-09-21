"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { SoundIcon } from "./sound-icon";

import { Button } from "@/components/ui/button";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

/** One from each shelf, so the frame is composed before anybody has picked. */
const SUGGESTIONS = sounds.categories.map((category) => category.sounds[0].id);

const SHELL = "bg-card/90 shadow-soft-lg rounded-md p-4 backdrop-blur sm:p-5";

/**
 * The frame reads the grid's own store, so what is in it is what is playing —
 * the hero carrying a fragment of the product rather than the headline said
 * twice. Six tiles either way: your picks at full strength, and whatever is
 * left filled in from the shelves at a third of it, so a mix of one still
 * looks like a composition.
 *
 * Two by three when it is overlaid on the photograph and three by two when it
 * has dropped below it — the same `@xl` that decides which of those two
 * happens, read from the centre column both times.
 */
export function HeroMix() {
  const selected = useSoundStore(
    useShallow((state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );

  const tiles = useMemo(() => {
    const out = selected.slice(0, 6);

    for (const id of SUGGESTIONS) {
      if (out.length >= 6) break;
      if (!out.includes(id)) out.push(id);
    }

    return out;
  }, [selected]);

  return (
    <div className={SHELL}>
      <p className="text-muted-foreground text-xs">In the mix</p>

      <p className="mt-1 text-lg font-medium tracking-tight">
        {selected.length
          ? `${selected.length} of ${count()} loops`
          : "Nothing picked yet"}
      </p>

      <div className="bg-secondary mt-3 grid aspect-[3/2] grid-cols-3 place-items-center gap-3 rounded-sm p-4 @xl:aspect-[313/367] @xl:grid-cols-2">
        {tiles.map((id) => (
          <span
            aria-hidden="true"
            className={cn(
              "transition-opacity",
              !selected.includes(id) && "opacity-35",
            )}
            key={id}
          >
            <SoundIcon id={id} size={40} />
          </span>
        ))}
      </div>
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
