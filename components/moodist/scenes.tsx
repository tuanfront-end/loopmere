"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";

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
    //
    // A toggle, so the name holds still and `aria-pressed` carries the state,
    // as on Swell. The name used to change with it — "Pause Night village" —
    // and a screen reader read that out as "Pause Night village, pressed".
    // Pressed is *sounding*, not merely loaded: a press on a scene that is the
    // mix but paused plays it, and a toggle reading pressed before and after
    // that press would say it had done nothing.
    <button
      aria-label={scene.title}
      aria-pressed={sounding}
      // A record from `data/scenes`, read in passing: its 14px lines are a
      // product object's, like the hero's panels.
      data-object
      className={cn(
        "bg-card group/scene relative flex flex-col rounded-lg border p-4 text-left transition-[border-color,box-shadow]",
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
      {/* Renders and transport share the top row, the play chip in the
          corner, so the box is three lines tall: what is in it, its name,
          the place. The count of loops that sat under them said what the
          renders already show. */}
      <span className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className="flex gap-1">
          {ids.map((id) => (
            <SoundIcon id={id} key={id} size={24} />
          ))}
        </span>

        {/* Brand when the scene is the mix, a quiet chip until then, so a
            grid of twelve does not shout. */}
        <span
          aria-hidden="true"
          className={cn(
            "-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-sm transition-colors",
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

      <span className="mt-3 text-sm font-medium">{scene.title}</span>
      <span className="text-muted-foreground mt-0.5 line-clamp-2 text-sm text-pretty">
        {scene.blurb}
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
        {/* A Thiings render, 32px, the way every shelf head is drawn. A
            village at night is a whole place in one object, which is what a
            scene is; it is also Night village's own render, until the set
            has one made for this shelf. */}
        <div aria-hidden="true" className="shrink-0">
          <SoundIcon id="night-village" size={32} />
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
