"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FADE_OUT } from "@/constants/events";
import { padNumber } from "@/helpers/number";
import { dispatch } from "@/lib/event";
import { useSleepTimerStore } from "@/stores/sleep-timer";
import { useSoundStore } from "@/stores/sound";
import { keepKeys } from "@/lib/keys";

interface SleepTimerModalProps {
  onClose: () => void;
  show: boolean;
}

function format(time: number) {
  return `${padNumber(Math.floor(time / 3600))}:${padNumber(
    Math.floor((time % 3600) / 60),
  )}:${padNumber(time % 60)}`;
}

export function SleepTimerModal({ onClose, show }: SleepTimerModalProps) {
  const setActive = useSleepTimerStore((state) => state.set);
  const noSelected = useSoundStore((state) => state.noSelected());
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const play = useSoundStore((state) => state.play);

  const [running, setRunning] = useState(false);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("10");
  const [timeSpent, setTimeSpent] = useState(0);

  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setActive(running), [running, setActive]);

  const totalSeconds = useMemo(
    () => (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60,
    [hours, minutes],
  );

  const timeLeft = totalSeconds - timeSpent;

  /** At zero the sounds fade rather than cut, which App listens for. */
  useEffect(() => {
    if (timeLeft !== 0 || !running) return;

    setRunning(false);
    setTimeSpent(0);
    dispatch(FADE_OUT, { duration: 1000 });

    if (timerId.current) clearInterval(timerId.current);
  }, [timeLeft, running]);

  useEffect(() => {
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  return (
    <ToolPanel
      blurb="Everything fades out when it reaches zero."
      show={show}
      title="Sleep timer"
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();

          if (timerId.current) clearInterval(timerId.current);
          if (noSelected || totalSeconds <= 0) return;
          if (!isPlaying) play();

          setRunning(true);
          timerId.current = setInterval(
            () => setTimeSpent((previous) => previous + 1),
            1000,
          );
        }}
      >
        {running ? (
          <div className="text-center">
            <p className="text-muted-foreground text-sm tabular-nums">
              {format(timeSpent)} gone
            </p>
            <p className="font-heading mt-1 text-5xl tracking-tighter tabular-nums">
              {format(timeLeft)}
            </p>
          </div>
        ) : (
          <div className="flex items-end justify-center gap-4">
            {(
              [
                ["Hours", hours, setHours, 23],
                ["Minutes", minutes, setMinutes, 59],
              ] as const
            ).map(([label, value, setValue, max]) => (
              <div key={label}>
                <label
                  className="text-muted-foreground mb-2 block text-center text-xs"
                  htmlFor={label}
                >
                  {label}
                </label>
                <Input
                  className="w-24 text-center tabular-nums"
                  id={label}
                  inputMode="numeric"
                  max={max}
                  min={0}
                  type="number"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  onKeyDown={keepKeys}
                />
              </div>
            ))}
          </div>
        )}

        {noSelected && !running && (
          <p className="text-muted-foreground text-center text-sm">
            Pick a sound first, or there is nothing for this to stop.
          </p>
        )}

        {running ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (timerId.current) clearInterval(timerId.current);
              setTimeSpent(0);
              setHours("0");
              setMinutes("10");
              setRunning(false);
            }}
          >
            Stop the timer
          </Button>
        ) : (
          <Button disabled={noSelected || totalSeconds <= 0} type="submit">
            Start
          </Button>
        )}
      </form>
    </ToolPanel>
  );
}
