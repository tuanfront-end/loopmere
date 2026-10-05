"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { signature, usePicked } from "./hero-panels";
import { SoundIcon } from "./sound-icon";

import { type Scene, SCENES } from "@/data/scenes";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

function SceneCard({ scene }: { scene: Scene }) {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const picked = usePicked();
  const ids = Object.keys(scene.sounds);
  const active = signature(ids) === picked;
  const sounding = active && isPlaying;

  return (
    // One control, so the card is the button: nothing inside it answers on
    // its own. The sound card's hover — the brand hairline and the cast —
    // and its state, the inset ring, so a scene that is on reads the way a
    // loop that is on does.
    <button
      aria-label={
        sounding
          ? `Pause ${scene.title}`
          : active
            ? `Play ${scene.title} again`
            : `Play ${scene.title}, a mix of ${ids.length} loops`
      }
      aria-pressed={active}
      // A record from `data/scenes`, read in passing: its 14px lines are a
      // product object's, like the hero's panels.
      data-object
      className={cn(
        "bg-card group/scene relative flex flex-col rounded-lg border p-4 text-left transition-[border-color,box-shadow] sm:p-5",
        "hover:border-primary/60 hover:shadow-soft focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
        active && "ring-primary ring-2 ring-inset",
      )}
      type="button"
      onClick={() => {
        const store = useSoundStore.getState();

        if (active) {
          store.togglePlay();
          return;
        }

        store.override(scene.sounds, { swell: scene.swell });
        store.play();
      }}
    >
      <span aria-hidden="true" className="flex gap-1">
        {ids.map((id) => (
          <SoundIcon id={id} key={id} size={28} />
        ))}
      </span>

      <span className="mt-4 text-base font-medium">{scene.title}</span>
      <span className="text-muted-foreground mt-1 text-sm text-pretty">
        {scene.blurb}
      </span>

      <span className="mt-auto flex items-center justify-between pt-4">
        <span className="text-muted-foreground text-xs">
          {ids.length} loops
        </span>

        {/* The card's own transport, drawn: brand when the scene is the mix,
            a quiet chip until then, so a grid of twelve does not shout. */}
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 place-items-center rounded-sm transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover/scene:text-foreground",
          )}
        >
          {sounding ? (
            <PauseIcon className="size-3.5" />
          ) : (
            <PlayIcon className="size-3.5" />
          )}
        </span>
      </span>
    </button>
  );
}

/**
 * Mixes made here, a shelf of places rather than of loops. It sits between
 * the hero and the first shelf and is not in "Jump to a shelf": a row more
 * there and the shelf list scrolls on a short laptop again. The hero's
 * "Three made earlier" points here instead.
 */
export function Scenes() {
  return (
    <section
      aria-labelledby="scenes-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-6 px-6 sm:px-8"
      id="scenes"
    >
      <div className="flex items-start gap-4">
        <div aria-hidden="true" className="text-primary-ink shrink-0">
          <HugeiconsIcon
            className="size-8"
            icon={Location01Icon}
            strokeWidth={1.5}
          />
        </div>

        <div>
          <h2 className="text-2xl tracking-tight" id="scenes-title">
            Scenes
          </h2>
          <p className="text-muted-foreground mt-1 max-w-[52ch] text-sm">
            {SCENES.length} places mixed for you, one click each.
          </p>
        </div>
      </div>

      {/* The shelves' grid steps, on the same centre column, so a scene and
          a loop line up when the page is read down. */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
        {SCENES.map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </section>
  );
}
