"use client";

import { ForwardIcon, PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MinusSignIcon, MusicNote01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import YouTube, { type YouTubePlayer } from "react-youtube";

import { Button } from "@/components/ui/button";
import { PERCENT, Slider } from "@/components/ui/slider";
import { FADE_OUT } from "@/constants/events";
import { STATIONS } from "@/data/stations";
import { subscribe } from "@/lib/event";
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

/**
 * The Lofi radio's one player, mounted once for the whole page and outside
 * every dialog. It lived inside the Lofi panel, which unmounts its contents on
 * close, so shutting the panel to reach the mix shut the music off with it.
 *
 * It stays on screen while it plays: YouTube's terms do not allow a player to
 * be hidden and heard. Shrinking it to a pill pauses it, and the pill says so.
 * On a phone it sits over the tab bar; from `xl` it sits at the foot of the
 * right rail, which pads its own scroll by the player's height.
 */
export function RadioPlayer() {
  const current = useRadioStore((state) => state.current);
  const minimised = useRadioStore((state) => state.minimised);
  const playing = useRadioStore((state) => state.playing);
  const volume = useRadioStore((state) => state.volume);
  const ownStations = useRadioStore((state) => state.stations);
  const { setMinimised, setPlaying, setVolume, stop, tune } =
    useRadioStore.getState();

  const player = useRef<YouTubePlayer | null>(null);
  const box = useRef<HTMLDivElement>(null);
  // Paused by the mix's own Pause, so the mix's Play brings it back; a pause
  // pressed on the radio itself stays paused.
  const pausedByMix = useRef(false);

  // The store's intent, carried to YouTube.
  useEffect(() => {
    const target = player.current;

    if (!target) return;

    if (playing && !minimised) target.playVideo();
    else target.pauseVideo();
  }, [playing, minimised]);

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
          if (radio.current && !radio.minimised) radio.setPlaying(true);
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

  // How much of the rail's foot the player covers, for the rail to scroll
  // clear of. Zero while there is no player, and under `xl`, where it is not
  // over the rail.
  useEffect(() => {
    const root = document.documentElement;
    const element = box.current;

    if (!element) {
      root.style.setProperty("--radio-cover", "0px");
      return;
    }

    const observer = new ResizeObserver(() =>
      root.style.setProperty("--radio-cover", `${element.offsetHeight + 16}px`),
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      root.style.setProperty("--radio-cover", "0px");
    };
  }, [current]);

  if (!current) return null;

  const all = [...ownStations, ...STATIONS];
  const next = () =>
    tune(all[(all.findIndex((s) => s.id === current.id) + 1) % all.length]);

  return (
    <div
      className={cn(
        "fixed z-40",
        // Over the tab bar on a phone; over the toolbar's buttons from `lg`;
        // at the foot of the right rail, inside its padding, from `xl`.
        "inset-x-3 bottom-[calc(var(--dock-cover,77px)+env(safe-area-inset-bottom,0px))] sm:right-3 sm:left-auto sm:w-80",
        "lg:right-6 lg:bottom-20",
        "xl:right-8 xl:bottom-8 xl:w-[300px] 2xl:w-[320px]",
      )}
      ref={box}
    >
      {minimised ? (
        <div className="bg-card/90 shadow-soft-lg ml-auto flex w-fit items-center gap-1 rounded-full border p-1 pl-3 backdrop-blur-xl">
          <HugeiconsIcon
            aria-hidden="true"
            className="text-primary-ink size-4 shrink-0"
            icon={MusicNote01Icon}
            strokeWidth={1.5}
          />
          <span className="max-w-44 truncate px-1 text-sm font-medium">
            {current.title}
          </span>
          <Button
            aria-label={`Play ${current.title}`}
            className="rounded-full"
            size="icon-sm"
            onClick={() => setMinimised(false)}
          >
            <PlayIcon />
          </Button>
          <Button
            aria-label="Turn the radio off"
            className="rounded-full"
            size="icon-sm"
            variant="ghost"
            onClick={stop}
          >
            <XMarkIcon />
          </Button>
        </div>
      ) : null}

      {/* Mounted while minimised too, only out of sight and paused: opening
          it again picks the stream up where it is rather than reloading. */}
      <section
        aria-label="Lofi radio"
        className={cn(
          "bg-card shadow-soft-lg flex flex-col gap-3 rounded-lg border p-3",
          minimised && "hidden",
        )}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 pl-1">
            <p className="text-muted-foreground truncate text-xs">
              {current.channel}
            </p>
            <p className="truncate text-sm font-medium">{current.title}</p>
          </div>
          <Button
            aria-label="Shrink the radio, pausing it"
            size="icon-sm"
            variant="ghost"
            onClick={() => setMinimised(true)}
          >
            <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.5} />
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

        {/* 200px is YouTube's floor for an embedded player. */}
        <div className="h-[200px] overflow-hidden rounded-sm bg-black">
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
    </div>
  );
}
