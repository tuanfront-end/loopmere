"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ToolPanel } from "../tool-panel";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { padNumber } from "@/helpers/number";

type Exercise = "4-7-8" | "box" | "resonant";
type Phase = "exhale" | "holdExhale" | "holdInhale" | "inhale";

const EXERCISES: Record<
  Exercise,
  { durations: Partial<Record<Phase, number>>; label: string; phases: Phase[] }
> = {
  "4-7-8": {
    durations: { exhale: 8, holdInhale: 7, inhale: 4 },
    label: "4-7-8, for getting to sleep",
    phases: ["inhale", "holdInhale", "exhale"],
  },
  box: {
    durations: { exhale: 4, holdExhale: 4, holdInhale: 4, inhale: 4 },
    label: "Box, four counts each way",
    phases: ["inhale", "holdInhale", "exhale", "holdExhale"],
  },
  resonant: {
    durations: { exhale: 5, inhale: 5 },
    label: "Resonant, five and five",
    phases: ["inhale", "exhale"],
  },
};

const PHASE_LABELS: Record<Phase, string> = {
  exhale: "Breathe out",
  holdExhale: "Hold",
  holdInhale: "Hold",
  inhale: "Breathe in",
};

interface BreathingModalProps {
  onClose: () => void;
  show: boolean;
}

export function BreathingModal({ onClose, show }: BreathingModalProps) {
  const [exercise, setExercise] = useState<Exercise>("4-7-8");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const { durations, phases } = EXERCISES[exercise];
  const phase = phases[phaseIndex];

  const advance = useCallback(
    () => setPhaseIndex((previous) => (previous + 1) % phases.length),
    [phases.length],
  );

  useEffect(() => setPhaseIndex(0), [exercise]);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(advance, (durations[phase] || 4) * 1000);

    return () => clearInterval(interval);
  }, [phase, durations, advance, show]);

  /** The clock only runs while the panel is open. */
  useEffect(() => {
    if (!show) return setElapsed(0);

    const interval = setInterval(
      () => setElapsed((previous) => previous + 1),
      1000,
    );

    return () => clearInterval(interval);
  }, [show]);

  const variants = useMemo(
    () => ({
      exhale: { scale: 1, transition: { duration: durations.exhale } },
      holdExhale: { scale: 1, transition: { duration: durations.holdExhale } },
      holdInhale: {
        scale: 1.5,
        transition: { duration: durations.holdInhale },
      },
      inhale: { scale: 1.5, transition: { duration: durations.inhale } },
    }),
    [durations],
  );

  return (
    <ToolPanel show={show} title="Breathing" onClose={onClose}>
      <div className="grid h-64 place-items-center">
        <div className="relative grid size-40 place-items-center">
          <motion.div
            animate={phase}
            aria-hidden="true"
            className="bg-chip absolute size-24 rounded-full"
            key={exercise}
            variants={variants}
          />
          <p className="relative text-sm font-medium">{PHASE_LABELS[phase]}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm tabular-nums">
          {padNumber(Math.floor(elapsed / 60))}:{padNumber(elapsed % 60)}
        </p>

        <Select
          items={Object.fromEntries(
            Object.entries(EXERCISES).map(([id, value]) => [id, value.label]),
          )}
          value={exercise}
          onValueChange={(next) => next && setExercise(next as Exercise)}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pattern</SelectLabel>
              {Object.entries(EXERCISES).map(([id, value]) => (
                <SelectItem key={id} value={id}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </ToolPanel>
  );
}
