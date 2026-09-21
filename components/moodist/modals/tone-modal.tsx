"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

/**
 * Two generators, one panel. A binaural beat is two oscillators a few hertz
 * apart, one in each ear; an isochronic beat is one tone switched on and off
 * by a square-wave modulator. Everything around them is the same, so they are
 * one component with a kind rather than two files that drift.
 */
type ToneKind = "binaural" | "isochronic";

const PRESETS = [
  { base: 100, beat: 2, id: "delta", label: "Delta, 2 Hz — deep sleep" },
  { base: 100, beat: 5, id: "theta", label: "Theta, 5 Hz — meditation" },
  { base: 100, beat: 10, id: "alpha", label: "Alpha, 10 Hz — unwinding" },
  { base: 100, beat: 20, id: "beta", label: "Beta, 20 Hz — focus" },
  { base: 100, beat: 40, id: "gamma", label: "Gamma, 40 Hz — sharp" },
  { base: 440, beat: 10, id: "custom", label: "Set it yourself" },
];

interface ToneModalProps {
  kind: ToneKind;
  onClose: () => void;
  show: boolean;
}

export function ToneModal({ kind, onClose, show }: ToneModalProps) {
  const [preset, setPreset] = useState("custom");
  const [base, setBase] = useState(440);
  const [beat, setBeat] = useState(10);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const context = useRef<AudioContext | null>(null);
  const nodes = useRef<Array<OscillatorNode>>([]);
  const gain = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    nodes.current.forEach((node) => node.stop());
    nodes.current = [];
    context.current?.close();
    context.current = null;
    setIsPlaying(false);
  }, []);

  const start = useCallback(() => {
    if (isPlaying) return;

    const ctx = new AudioContext();
    context.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    gain.current = master;

    if (kind === "binaural") {
      // Half the beat below in one ear, half above in the other; the beat is
      // what the two ears make between them.
      ([-1, 1] as const).forEach((pan) => {
        const oscillator = ctx.createOscillator();
        oscillator.frequency.value = base + (pan * beat) / 2;

        const panner = ctx.createStereoPanner();
        panner.pan.value = pan;

        oscillator.connect(panner).connect(master);
        oscillator.start();
        nodes.current.push(oscillator);
      });
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.frequency.value = base;

      const pulse = ctx.createGain();
      pulse.gain.value = 0;

      const modulator = ctx.createOscillator();
      modulator.frequency.value = beat;
      modulator.type = "square";

      const depth = ctx.createGain();
      depth.gain.value = 0.5;

      modulator.connect(depth).connect(pulse.gain);
      oscillator.connect(pulse).connect(master);

      oscillator.start();
      modulator.start();
      nodes.current.push(oscillator, modulator);
    }

    setIsPlaying(true);
  }, [isPlaying, kind, base, beat, volume]);

  useEffect(() => {
    if (gain.current) gain.current.gain.value = volume;
  }, [volume]);

  /** A live tone follows the dials without being restarted. */
  useEffect(() => {
    if (kind !== "binaural" || nodes.current.length !== 2) return;

    nodes.current[0].frequency.value = base - beat / 2;
    nodes.current[1].frequency.value = base + beat / 2;
  }, [base, beat, kind]);

  useEffect(() => {
    if (preset === "custom") return;

    const match = PRESETS.find((item) => item.id === preset);

    if (match) {
      setBase(match.base);
      setBeat(match.beat);
    }
  }, [preset]);

  /** Closing the panel stops the tone; leaving it running would be a trap. */
  useEffect(() => {
    if (!show && isPlaying) stop();
  }, [show, isPlaying, stop]);

  useEffect(() => stop, [stop]);

  return (
    <ToolPanel
      show={show}
      onClose={onClose}
      title={kind === "binaural" ? "Binaural beat" : "Isochronic tone"}
      blurb={
        kind === "binaural"
          ? "Two tones a few hertz apart, one per ear. Headphones or nothing."
          : "One tone switched on and off. This one works on speakers."
      }
    >
      <Select value={preset} onValueChange={setPreset}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Band</SelectLabel>
            {PRESETS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex gap-4">
          {(
            [
              ["Carrier in Hz", base, setBase, 20, 1500],
              ["Beat in Hz", beat, setBeat, 0.5, 40],
            ] as const
          ).map(([label, value, setValue, min, max]) => (
            <div className="flex-1" key={label}>
              <label
                className="text-muted-foreground mb-2 block text-xs"
                htmlFor={label}
              >
                {label}
              </label>
              <Input
                className="tabular-nums"
                id={label}
                max={max}
                min={min}
                step={0.1}
                type="number"
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Level</p>
          <p className="text-muted-foreground text-xs tabular-nums">
            {Math.round(volume * 100)}%
          </p>
        </div>
        <Slider
          aria-label="Tone level"
          className="mt-4"
          max={1}
          min={0}
          step={0.01}
          value={[volume]}
          onValueChange={([next]) => setVolume(next)}
        />
      </div>

      <Button onClick={() => (isPlaying ? stop() : start())}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
        {isPlaying ? "Stop" : "Play"}
      </Button>
    </ToolPanel>
  );
}
