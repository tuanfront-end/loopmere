"use client";

import { useCallback, useEffect, useState } from "react";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { padNumber } from "@/helpers/number";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { useSettingsStore } from "@/stores/settings";

interface CountdownProps {
  onClose: () => void;
  show: boolean;
}

function formatTime(time: number) {
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = time % 60;

  return `${padNumber(hrs)}:${padNumber(mins)}:${padNumber(secs)}`;
}

export function Countdown({ onClose, show }: CountdownProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  const alarmVolume = useSettingsStore((state) => state.alarmVolume);
  const alarm = useSoundEffect("/sounds/alarm.mp3", alarmVolume);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      alarm.play();
      setIsActive(false);
      setIsFormVisible(true);
    }

    return () => clearTimeout(timer);
  }, [isActive, timeLeft, alarm]);

  const start = useCallback(() => {
    const total = hours * 3600 + minutes * 60 + seconds;

    if (!total) return;

    setTimeLeft(total);
    setInitialTime(total);
    setIsActive(true);
    setIsFormVisible(false);
  }, [hours, minutes, seconds]);

  const elapsed = initialTime - timeLeft;

  return (
    <ToolPanel
      blurb="Set it, start it, and let it interrupt you."
      show={show}
      title="Countdown"
      onClose={onClose}
    >
      {isFormVisible ? (
        <>
          <div className="flex items-center justify-center gap-2">
            {(
              [
                ["Hours", hours, setHours, 99],
                ["Minutes", minutes, setMinutes, 59],
                ["Seconds", seconds, setSeconds, 59],
              ] as const
            ).map(([label, value, setValue, max], index) => (
              <div className="flex items-center gap-2" key={label}>
                {index > 0 && <span className="text-muted-foreground">:</span>}
                <div>
                  <Input
                    aria-label={label}
                    className="w-20 text-center tabular-nums"
                    inputMode="numeric"
                    max={max}
                    min={0}
                    type="number"
                    value={value}
                    onChange={(event) =>
                      setValue(
                        Math.max(
                          0,
                          Math.min(
                            max,
                            Number.parseInt(event.target.value, 10) || 0,
                          ),
                        ),
                      )
                    }
                  />
                  <p className="text-muted-foreground mt-2 text-center text-xs">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            disabled={!hours && !minutes && !seconds}
            size="lg"
            onClick={start}
          >
            Start
          </Button>
        </>
      ) : (
        <>
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm tabular-nums">
              {formatTime(elapsed)} gone
            </p>
            <p className="font-heading mt-1 text-5xl tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setIsActive(false);
                setIsFormVisible(true);
                setTimeLeft(0);
              }}
            >
              Set a new one
            </Button>
            <Button
              className="flex-1"
              onClick={() => setIsActive((previous) => !previous)}
            >
              {isActive ? "Pause" : "Resume"}
            </Button>
          </div>
        </>
      )}
    </ToolPanel>
  );
}
