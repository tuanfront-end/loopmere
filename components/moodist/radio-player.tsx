"use client";

import { ForwardIcon, PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { MinusSignIcon, MusicNote01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import YouTube, { type YouTubePlayer } from "react-youtube";

import { Button } from "@/components/ui/button";
import { PERCENT, Slider } from "@/components/ui/slider";
import { FADE_OUT } from "@/constants/events";
import { STATIONS } from "@/data/stations";
import { subscribe } from "@/lib/event";
import { scrollBehavior } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useRadioStore } from "@/stores/radio";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

const OPTS = {
  height: "100%",
  // The privacy-enhanced host: no YouTube cookie until the video is played.
  host: "https://www.youtube-nocookie.com",
  playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
  width: "100%",
} as const;

/** The level YouTube is given: the radio's own times Everything, 0 to 100. */
function level() {
  return Math.round(
    useRadioStore.getState().volume *
      useSettingsStore.getState().globalVolume *
      100,
  );
}

/** The width from which the player sits in the right rail rather than over the page. */
const DOCKED = "(min-width: 1280px)";

function subscribeDocked(onChange: () => void) {
  const query = window.matchMedia(DOCKED);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

/**
 * The Lofi radio's one player, mounted once for the whole page and outside
 * every dialog. It lived inside the Lofi panel, which unmounts its contents on
 * close, so shutting the panel to reach the mix shut the music off with it.
 *
 * From `xl` it is part of the right rail, under its last tools, scrolled with
 * them rather than floated over them; the rail scrolls to it when a station
 * is picked. Under `xl` there is no rail, so it floats over the tab bar.
 * Crossing `xl` moves it between the two, which reloads the stream — a window
 * resize, never a phone.
 *
 * Shrinking it folds the video away and keeps playing.
 *
 * YouTube's terms ask for a visible player of at least 200 by 200 while it
 * plays, and a folded one is not. Kept that way on purpose; folding back to
 * pausing is the `playing` effect below.
 */
export function RadioPlayer() {
  const current = useRadioStore((state) => state.current);
  const minimised = useRadioStore((state) => state.minimised);
  const playing = useRadioStore((state) => state.playing);
  const volume = useRadioStore((state) => state.volume);
  const ownStations = useRadioStore((state) => state.stations);
  const { setMinimised, setPlaying, setVolume, stop, tune } =
    useRadioStore.getState();

  const docked = useSyncExternalStore(
    subscribeDocked,
    () => window.matchMedia(DOCKED).matches,
    () => false,
  );

  const player = useRef<YouTubePlayer | null>(null);
  // Paused by the mix's own Pause, so the mix's Play brings it back; a pause
  // pressed on the radio itself stays paused.
  const pausedByMix = useRef(false);

  // The store's intent, carried to YouTube.
  useEffect(() => {
    const target = player.current;

    if (!target) return;

    if (playing) target.playVideo();
    else target.pauseVideo();
  }, [playing]);

  // Its own level and Everything, both read fresh: Everything moving does not
  // re-render this, as it re-renders no card.
  useEffect(() => {
    player.current?.setVolume(level());
  }, [volume]);

  useEffect(
    () =>
      useSettingsStore.subscribe((state, previous) => {
        if (state.globalVolume !== previous.globalVolume)
          player.current?.setVolume(level());
      }),
    [],
  );

  // The mix's transport reaches the radio: Pause pauses it, Play brings it
  // back if that Pause was what stopped it.
  useEffect(
    () =>
      useSoundStore.subscribe((state, previous) => {
        if (state.isPlaying === previous.isPlaying) return;

        const radio = useRadioStore.getState();

        if (!state.isPlaying && radio.playing) {
          pausedByMix.current = true;
          radio.setPlaying(false);
        } else if (state.isPlaying && pausedByMix.current) {
          pausedByMix.current = false;
          if (radio.current) radio.setPlaying(true);
        }
      }),
    [],
  );

  // The sleep timer fades the radio with the sounds, then pauses it.
  useEffect(
    () =>
      subscribe(FADE_OUT, (event: { duration: number }) => {
        const target = player.current;

        if (!target || !useRadioStore.getState().playing) return;

        const from = level();
        const started = performance.now();
        const step = () => {
          const done = (performance.now() - started) / event.duration;

          if (done >= 1) {
            useRadioStore.getState().setPlaying(false);
            target.setVolume(level());
            return;
          }

          target.setVolume(Math.round(from * (1 - done)));
          requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      }),
    [],
  );

  // In the rail, a station just picked may be below the fold: bring it up,
  // by scrolling the rail alone, to its foot, where the player is. Once the
  // Lofi panel has closed: closing hands focus back to whatever opened it,
  // which scrolls the rail to that button and undid a scroll made earlier.
  useEffect(() => {
    if (!docked || !current) return;

    const timer = setTimeout(() => {
      const rail = document.getElementById("radio-slot")?.parentElement;

      rail?.scrollTo({ behavior: scrollBehavior(), top: rail.scrollHeight });
    }, 400);

    return () => clearTimeout(timer);
  }, [docked, current]);

  if (!current) return null;

  const slot = docked ? document.getElementById("radio-slot") : null;

  if (docked && !slot) return null;

  const all = [...ownStations, ...STATIONS];
  const next = () =>
    tune(all[(all.findIndex((s) => s.id === current.id) + 1) % all.length]);

  const card = (
    <section
      aria-label="Lofi radio"
      className={cn(
        "bg-card flex flex-col gap-3 border p-3",
        docked
          ? // A row of the rail, like the mix desk's: flat, its hairline.
            "rounded-sm"
          : // Over the page, lifted off it, and placed clear of what is
            // fixed there: the tab bar on a phone, the toolbar from `lg`.
            "shadow-soft-lg fixed inset-x-3 bottom-[calc(var(--dock-cover,77px)+env(safe-area-inset-bottom,0px))] z-40 rounded-lg sm:right-3 sm:left-auto sm:w-80 lg:right-6 lg:bottom-20",
      )}
    >
      <div className="flex items-start gap-2">
        <HugeiconsIcon
          aria-hidden="true"
          className="text-primary-ink mt-0.5 size-4 shrink-0"
          icon={MusicNote01Icon}
          strokeWidth={1.5}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{current.title}</p>
          <p className="text-muted-foreground truncate text-xs">
            {current.channel}
          </p>
        </div>
        <Button
          aria-expanded={!minimised}
          aria-label={minimised ? "Show the video" : "Fold the video away"}
          size="icon-sm"
          variant="ghost"
          onClick={() => setMinimised(!minimised)}
        >
          {minimised ? (
            <ArrowsPointingOutIcon />
          ) : (
            <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.5} />
          )}
        </Button>
        <Button
          aria-label="Turn the radio off"
          className="-mr-1"
          size="icon-sm"
          variant="ghost"
          onClick={stop}
        >
          <XMarkIcon />
        </Button>
      </div>

      {/* Folded to no height rather than hidden, so the frame is still laid
          out and the stream keeps going; 200px open, YouTube's floor. */}
      <div
        className={cn(
          "overflow-hidden rounded-sm bg-black",
          minimised ? "h-0" : "h-[200px]",
        )}
      >
        <YouTube
          className="size-full"
          iframeClassName="size-full"
          opts={OPTS}
          title={`${current.title}, ${current.channel}`}
          videoId={current.id}
          onPause={() => {
            if (!pausedByMix.current) setPlaying(false);
          }}
          onPlay={() => {
            pausedByMix.current = false;
            setPlaying(true);
          }}
          onReady={(event) => {
            player.current = event.target;
            event.target.setVolume(level());
            if (!useRadioStore.getState().playing) event.target.pauseVideo();
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label={
            playing ? `Pause ${current.title}` : `Play ${current.title}`
          }
          size="icon-sm"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          aria-label="Next station"
          size="icon-sm"
          variant="ghost"
          onClick={next}
        >
          <ForwardIcon />
        </Button>
        <Slider
          aria-label="Radio level"
          className="ml-1 min-w-0 flex-1"
          format={PERCENT}
          max={1}
          min={0}
          step={0.01}
          value={[volume]}
          onValueChange={(value) =>
            setVolume(Array.isArray(value) ? value[0] : value)
          }
        />
      </div>
    </section>
  );

  // In the rail it is a section of the rail, under the eyebrow every other
  // section there wears.
  return slot
    ? createPortal(
        <div>
          <h2 className="text-muted-foreground px-2.5 text-xs tracking-widest uppercase">
            Radio
          </h2>
          <div className="mt-4">{card}</div>
        </div>,
        slot,
      )
    : card;
}
