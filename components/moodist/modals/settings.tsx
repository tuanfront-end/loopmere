"use client";

import { ToolPanel } from "../tool-panel";

import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/stores/settings";
import { PERCENT } from "@/components/ui/slider";

interface SettingsModalProps {
  onClose: () => void;
  show: boolean;
}

export function SettingsModal({ onClose, show }: SettingsModalProps) {
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const alarmVolume = useSettingsStore((state) => state.alarmVolume);
  const setGlobalVolume = useSettingsStore((state) => state.setGlobalVolume);
  const setAlarmVolume = useSettingsStore((state) => state.setAlarmVolume);

  return (
    <ToolPanel show={show} title="Levels" onClose={onClose}>
      {(
        [
          ["Everything", globalVolume, setGlobalVolume],
          ["Alarms and timers", alarmVolume, setAlarmVolume],
        ] as const
      ).map(([label, value, setValue]) => (
        <div key={label}>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {Math.round(value * 100)}%
            </p>
          </div>
          <Slider
            format={PERCENT}
            aria-label={`${label} level`}
            className="mt-4"
            max={1}
            min={0}
            step={0.01}
            value={[value]}
            onValueChange={(next) =>
              setValue(Array.isArray(next) ? next[0] : next)
            }
          />
        </div>
      ))}
    </ToolPanel>
  );
}
