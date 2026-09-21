"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BrowserDetect } from "@/helpers/browser-detect";
import { useSoundStore } from "@/stores/sound";

/**
 * Howler plays through the Web Audio API, which the OS media keys cannot see.
 * A looping silent track gives the Media Session API something to attach to,
 * so the lock screen and the headphone buttons control the mix.
 */
export function MediaSession() {
  const [supported, setSupported] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  const isPlaying = useSoundStore((state) => state.isPlaying);
  const play = useSoundStore((state) => state.play);
  const pause = useSoundStore((state) => state.pause);

  useEffect(() => setSupported("mediaSession" in navigator), []);

  useEffect(() => {
    if (!supported || !isPlaying) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      artist: "Moodist",
      artwork: [{ sizes: "200x200", src: "/logo-light.png", type: "image/png" }],
      title: "Ambient sound, mixed by you",
    });
  }, [supported, isPlaying]);

  const start = useCallback(async () => {
    const element = audio.current;

    if (!element || !element.paused) return;

    try {
      await element.play();

      navigator.mediaSession.playbackState = "playing";
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", pause);
    } catch {
      // Autoplay refused: the controls simply stay inert until a real click.
    }
  }, [pause, play]);

  const stop = useCallback(() => {
    const element = audio.current;

    if (!element) return;

    // Safari will not play again through the media keys after a plain pause.
    if (BrowserDetect.isSafari()) element.load();
    else element.pause();

    navigator.mediaSession.playbackState = "paused";
  }, []);

  useEffect(() => {
    if (!supported) return;

    if (isPlaying) start();
    else stop();
  }, [supported, isPlaying, start, stop]);

  useEffect(() => {
    if (!supported) return;

    const element = audio.current;

    return () => {
      element?.pause();
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.playbackState = "none";
    };
  }, [supported]);

  if (!supported) return null;

  return <audio loop ref={audio} src="/sounds/silence.wav" />;
}
