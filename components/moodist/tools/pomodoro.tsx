"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { Settings02Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ToolButton } from "../tool-button";
import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { padNumber } from "@/helpers/number";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import { keepKeys } from "@/lib/keys";

interface PomodoroProps {
  onClose: () => void;
  /** Re-opens the timer once its settings sheet is done with. */
  open: () => void;
  show: boolean;
}

const TABS = [
  { id: "pomodoro", label: "Focus" },
  { id: "short", label: "Break" },
  { id: "long", label: "Long break" },
] as const;

export function Pomodoro({ onClose, open, show }: PomodoroProps) {
  const [showSetting, setShowSetting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("pomodoro");
  const [timer, setTimer] = useState(0);
  const [completions, setCompletions] = useState<Record<string, number>>({});

  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const running = usePomodoroStore((state) => state.running);
  const setRunning = usePomodoroStore((state) => state.setRunning);
  const alarmVolume = useSettingsStore((state) => state.alarmVolume);
  const alarm = useSoundEffect("/sounds/alarm.mp3", alarmVolume);

  const defaultTimes = useMemo(
    () => ({ long: 15 * 60, pomodoro: 25 * 60, short: 5 * 60 }),
    [],
  );

  const [times, setTimes] = useLocalStorage<Record<string, number>>(
    "moodist-pomodoro-setting",
    defaultTimes,
  );

  useEffect(() => {
    if (interval.current) clearInterval(interval.current);

    if (running) {
      interval.current = setInterval(
        () => setTimer((previous) => previous - 1),
        1000,
      );
    }

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  useEffect(() => {
    if (timer > 0 || !running) return;

    if (interval.current) clearInterval(interval.current);

    alarm.play();
    setRunning(false);
    setCompletions((previous) => ({
      ...previous,
      [selectedTab]: (previous[selectedTab] || 0) + 1,
    }));
  }, [timer, selectedTab, running, setRunning, alarm]);

  /** Switching tab, or changing a length, resets the clock rather than pausing it. */
  useEffect(() => {
    if (interval.current) clearInterval(interval.current);

    setRunning(false);
    setTimer(times[selectedTab] || 10);
  }, [selectedTab, times, setRunning]);

  const hours = Math.floor(timer / 3600) || 0;
  const minutes = Math.floor((timer % 3600) / 60) || 0;
  const seconds = timer % 60 || 0;

  return (
    <>
      <ToolPanel
        show={show}
        title="Pomodoro"
        onClose={onClose}
        action={
          <ToolButton
            label="Change the lengths"
            onClick={() => {
              onClose();
              setShowSetting(true);
            }}
          >
            <HugeiconsIcon icon={Settings02Icon} strokeWidth={1.5} />
          </ToolButton>
        }
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <p className="font-heading py-4 text-center text-6xl tracking-tighter tabular-nums">
          {padNumber(hours)}:{padNumber(minutes)}:{padNumber(seconds)}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            {completions[selectedTab] || 0} done today
          </p>

          <div className="flex items-center gap-1">
            <ToolButton
              label="Back to the start"
              onClick={() => {
                if (interval.current) clearInterval(interval.current);
                setRunning(false);
                setTimer(times[selectedTab] || 10);
              }}
            >
              <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.5} />
            </ToolButton>

            <Button
              onClick={() => {
                if (running) return setRunning(false);
                if (timer <= 0) setTimer(times[selectedTab] || 10);
                setRunning(true);
              }}
            >
              {running ? <PauseIcon /> : <PlayIcon />}
              {running ? "Pause" : "Start"}
            </Button>
          </div>
        </div>
      </ToolPanel>

      <PomodoroSettings
        show={showSetting}
        times={times}
        onChange={(next) => {
          setShowSetting(false);
          setTimes(next);
          open();
        }}
        onClose={() => {
          setShowSetting(false);
          open();
        }}
      />
    </>
  );
}

interface PomodoroSettingsProps {
  onChange: (times: Record<string, number>) => void;
  onClose: () => void;
  show: boolean;
  times: Record<string, number>;
}

function PomodoroSettings({
  onChange,
  onClose,
  show,
  times,
}: PomodoroSettingsProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!show) return;

    setValues(
      Object.fromEntries(
        Object.entries(times).map(([key, value]) => [key, String(value / 60)]),
      ),
    );
  }, [times, show]);

  return (
    <ToolPanel show={show} title="Lengths" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();

          onChange(
            Object.fromEntries(
              TABS.map(({ id }) => [
                id,
                Number(values[id]) > 0 ? Number(values[id]) * 60 : times[id],
              ]),
            ),
          );
        }}
      >
        {TABS.map((tab) => (
          <div className="flex items-center justify-between gap-4" key={tab.id}>
            <label className="text-sm font-medium" htmlFor={tab.id}>
              {tab.label}{" "}
              <span className="text-muted-foreground font-normal">
                in minutes
              </span>
            </label>
            <Input
              className="w-24 text-center tabular-nums"
              id={tab.id}
              max={120}
              min={1}
              required
              type="number"
              value={values[tab.id] ?? ""}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  [tab.id]: event.target.value,
                }))
              }
              onKeyDown={keepKeys}
            />
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="flex-1" type="submit">
            Save
          </Button>
        </div>
      </form>
    </ToolPanel>
  );
}
