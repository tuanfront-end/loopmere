"use client";

import { useMemo, useEffect, useCallback, useState, useRef } from "react";
import { Howl } from "howler";

import { useLoadingStore } from "@/stores/loading";
import { useSettingsStore } from "@/stores/settings";
import { subscribe } from "@/lib/event";
import { useSSR } from "./use-ssr";
import { FADE_OUT } from "@/constants/events";

const DEFAULT_FADE_DURATION = 250;

/** The sprite a sound with a loop window plays. */
const WINDOW = "window";

/**
 * Swell rides the level on a cosine from the slider's level down to this share
 * of it and back. Moodist's floor, kept: low enough to hear the sound recede,
 * high enough that it never seems to leave the mix.
 */
const SWELL_FLOOR = 0.4;

/**
 * One wave, picked per sound from this range each time Swell goes on.
 * Moodist gives every sound the same ten seconds, measured from when it
 * started, so a mix started with one press rose and fell as a block.
 */
const SWELL_PERIOD = { max: 15_000, min: 9_000 };

/**
 * The wave is drawn as this many straight ramps a cycle, each one run by Web
 * Audio on the audio clock. Moodist set the level from a 50ms interval
 * instead, which a background tab throttles to once a second, and the wave
 * went out in audible steps; here a late timer only holds the level a moment
 * at the end of a ramp.
 */
const SWELL_SEGMENTS = 8;

/** How long a swelling sound takes to settle back on its level. */
const SWELL_RELEASE = 1000;

type SwellCurve = { period: number; start: number };

/** The share of the level a swell stands at, at `time`; 1 without a swell. */
function swellAt(curve: SwellCurve | null, time: number) {
  if (!curve) return 1;

  const phase = ((time - curve.start) / curve.period) * 2 * Math.PI;

  return SWELL_FLOOR + ((1 - SWELL_FLOOR) * (1 + Math.cos(phase))) / 2;
}

/**
 * A custom React hook to manage sound playback using Howler.js with additional features.
 *
 * This hook initializes a Howl instance for playing sound effects in the browser,
 * and provides control functions to play, stop, pause, and fade out the sound.
 * It also handles loading state management and supports event subscription for fade-out effects.
 *
 * @param {string} src - The source URL of the sound file.
 * @param {Object} [options] - Options for sound playback.
 * @param {boolean} [options.loop=false] - Whether the sound should loop.
 * @param {[number, number]} [options.loopWindow] - The stretch of the file to play, in seconds.
 * @param {boolean} [options.swell=false] - Whether its level rises and falls on a slow wave.
 * @param {number} [options.volume=0.5] - The initial volume of the sound, ranging from 0.0 to 1.0.
 * @returns {{ play: () => void, stop: () => void, pause: () => void, fadeOut: (duration: number) => void, isLoading: boolean }} An object containing control functions for the sound:
 *   - play: Function to play the sound.
 *   - stop: Function to stop the sound.
 *   - pause: Function to pause the sound.
 *   - fadeOut: Function to fade out the sound over a given duration.
 *   - isLoading: A boolean indicating if the sound is currently loading.
 */
export function useSound(
  src: string,
  options: {
    loop?: boolean;
    loopWindow?: [number, number];
    preload?: boolean;
    swell?: boolean;
    volume?: number;
  } = {},
  html5: boolean = false,
) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoading = useLoadingStore((state) => state.loaders[src]);
  const setIsLoading = useLoadingStore((state) => state.set);
  const transitionToken = useRef(0);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetVolume = useRef(options.volume ?? 0.5);
  const isFadingOut = useRef(false);

  // Whether the sound is meant to be sounding: set by play, cleared by pause
  // and stop. `sound.playing()` cannot say it, since it is still true through
  // a fade out and false until a first play has loaded.
  const isActive = useRef(false);
  const swellCurve = useRef<SwellCurve | null>(null);
  const swellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Where the last ramp ends, which is where the next one starts. Howler's own
  // reading of the level is updated by a timer and lags behind the ramp.
  const swellLevel = useRef(0);

  const { isBrowser } = useSSR();
  const sound = useMemo<Howl | null>(() => {
    let sound: Howl | null = null;

    if (isBrowser) {
      const range = options.loopWindow;

      sound = new Howl({
        html5,
        onload: () => {
          setIsLoading(src, false);
          setHasLoaded(true);
        },
        preload: options.preload ?? false,
        // A window is a sprite, which Web Audio loops on its own bounds to
        // the sample: no timer decides where the seam falls.
        sprite: range && {
          [WINDOW]: [range[0] * 1000, (range[1] - range[0]) * 1000],
        },
        src: src,
      });
    }

    return sound;
  }, [
    src,
    isBrowser,
    setIsLoading,
    html5,
    options.preload,
    options.loopWindow,
  ]);

  // The window's sound, once it has been played, so a pause resumes that one
  // rather than starting the sprite again from its top.
  const windowId = useRef<number | null>(null);

  // Media rather than a UI sound, so iOS plays it through the silent switch.
  // Set in an effect, not while the Howl is made: a memo is render, and render
  // does not write to the browser. It still lands before the first play, which
  // only a tap can start.
  useEffect(() => {
    if (window.navigator.audioSession) {
      window.navigator.audioSession.type = "playback";
    }
  }, []);

  useEffect(() => {
    if (sound) {
      sound.loop(options.loop ?? false);
    }
  }, [sound, options.loop]);

  /**
   * The level the Howl sits at is this sound's own times the global one, and
   * the global part is read from its store here rather than passed in. Passed
   * in, it was a prop on every card, and one step of the Everything slider
   * re-rendered all of them; applied to the Howl directly, it re-renders none.
   */
  const ownVolume = useRef(options.volume ?? 0.5);

  const clearSwellTimer = useCallback(() => {
    if (swellTimer.current) {
      clearTimeout(swellTimer.current);
      swellTimer.current = null;
    }
  }, []);

  /**
   * One ramp toward the point the wave reaches a segment from now, and a timer
   * to start the next one there. Each ramp reads the level afresh, so a moved
   * slider is the new top of the wave from the next ramp on.
   */
  const stepSwell = useCallback(
    function step() {
      clearSwellTimer();

      const curve = swellCurve.current;

      if (!sound || !curve || !isActive.current || isFadingOut.current) return;

      const segment = curve.period / SWELL_SEGMENTS;
      const to =
        targetVolume.current * swellAt(curve, performance.now() + segment);

      sound.fade(swellLevel.current, to, segment);
      swellLevel.current = to;
      swellTimer.current = setTimeout(step, segment);
    },
    [sound, clearSwellTimer],
  );

  const applyVolume = useCallback(() => {
    targetVolume.current =
      ownVolume.current * useSettingsStore.getState().globalVolume;

    if (sound && !isFadingOut.current) {
      swellLevel.current =
        targetVolume.current * swellAt(swellCurve.current, performance.now());
      sound.volume(swellLevel.current);

      // Setting the level cancels the ramp under way; start the next from here.
      if (swellCurve.current) stepSwell();
    }
  }, [sound, stepSwell]);

  useEffect(() => {
    if (!options.swell) {
      if (!swellCurve.current) return;

      swellCurve.current = null;
      clearSwellTimer();

      // Back to the level, gently, rather than in one jump from wherever the
      // wave had got to.
      if (sound && isActive.current && !isFadingOut.current) {
        sound.fade(swellLevel.current, targetVolume.current, SWELL_RELEASE);
        swellLevel.current = targetVolume.current;
      }

      return;
    }

    // The wave starts at its top, which is the level the sound is already at,
    // so switching it on is the sound beginning to recede rather than a jump.
    swellCurve.current = {
      period:
        SWELL_PERIOD.min +
        Math.random() * (SWELL_PERIOD.max - SWELL_PERIOD.min),
      start: performance.now(),
    };
    swellLevel.current = targetVolume.current;
    stepSwell();
  }, [options.swell, sound, stepSwell, clearSwellTimer]);

  useEffect(() => {
    ownVolume.current = options.volume ?? 0.5;
    applyVolume();
  }, [options.volume, applyVolume]);

  useEffect(
    () =>
      useSettingsStore.subscribe((state, previous) => {
        if (state.globalVolume !== previous.globalVolume) applyVolume();
      }),
    [applyVolume],
  );

  const clearFadeTimeout = useCallback(() => {
    if (fadeTimeout.current) {
      clearTimeout(fadeTimeout.current);
      fadeTimeout.current = null;
    }
  }, []);

  const play = useCallback(
    (cb?: () => void) => {
      if (sound) {
        transitionToken.current += 1;
        isFadingOut.current = false;
        isActive.current = true;
        clearFadeTimeout();

        if (!hasLoaded && !isLoading) {
          setIsLoading(src, true);
          sound.load();
        }

        if (!sound.playing()) {
          if (options.loopWindow)
            windowId.current = sound.play(windowId.current ?? WINDOW);
          else sound.play();
        }

        const currentVolume = sound.volume();
        const nextVolume =
          targetVolume.current *
          swellAt(
            swellCurve.current,
            performance.now() + DEFAULT_FADE_DURATION,
          );

        if (currentVolume !== nextVolume) {
          sound.fade(currentVolume, nextVolume, DEFAULT_FADE_DURATION);
        }

        // The wave picks up where the fade in lands, once it has.
        swellLevel.current = nextVolume;
        clearSwellTimer();
        if (swellCurve.current) {
          swellTimer.current = setTimeout(stepSwell, DEFAULT_FADE_DURATION);
        }

        if (typeof cb === "function") sound.once("end", cb);
      }
    },
    [
      src,
      setIsLoading,
      sound,
      hasLoaded,
      isLoading,
      clearFadeTimeout,
      clearSwellTimer,
      stepSwell,
      options.loopWindow,
    ],
  );

  const stop = useCallback(() => {
    transitionToken.current += 1;
    isFadingOut.current = false;
    isActive.current = false;
    clearFadeTimeout();
    clearSwellTimer();

    if (sound) {
      sound.stop();
      sound.volume(targetVolume.current);
    }
  }, [sound, clearFadeTimeout, clearSwellTimer]);

  const pause = useCallback(
    (duration: number = DEFAULT_FADE_DURATION) => {
      if (!sound) return;

      transitionToken.current += 1;
      const token = transitionToken.current;
      isFadingOut.current = true;
      isActive.current = false;
      clearFadeTimeout();
      clearSwellTimer();

      if (!sound.playing()) {
        isFadingOut.current = false;
        sound.volume(targetVolume.current);
        return;
      }

      const currentVolume = sound.volume();

      if (duration <= 0 || currentVolume <= 0) {
        sound.pause();
        isFadingOut.current = false;
        sound.volume(targetVolume.current);
        return;
      }

      sound.fade(currentVolume, 0, duration);

      fadeTimeout.current = setTimeout(() => {
        if (transitionToken.current !== token) return;

        sound.pause();
        isFadingOut.current = false;
        sound.volume(targetVolume.current);
      }, duration);
    },
    [sound, clearFadeTimeout, clearSwellTimer],
  );

  const fadeOut = useCallback(
    (duration: number) => {
      pause(duration);
    },
    [pause],
  );

  useEffect(() => {
    const listener = (e: { duration: number }) => fadeOut(e.duration);

    return subscribe(FADE_OUT, listener);
  }, [fadeOut]);

  useEffect(() => {
    return () => {
      clearFadeTimeout();
      clearSwellTimer();
    };
  }, [clearFadeTimeout, clearSwellTimer]);

  const control = useMemo(
    () => ({ fadeOut, isLoading, pause, play, stop }),
    [play, stop, pause, isLoading, fadeOut],
  );

  return control;
}
