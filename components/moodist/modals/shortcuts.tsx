"use client";

import { ToolPanel } from "../tool-panel";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings";

interface ShortcutsModalProps {
  onClose: () => void;
  show: boolean;
}

const SHORTCUTS = [
  { keys: ["Shift", "M"], label: "Tools menu" },
  { keys: ["Shift", "Space"], label: "Play or pause" },
  { keys: ["Shift", "R"], label: "Clear the mix" },
  { keys: ["Shift", "Alt", "P"], label: "Presets" },
  { keys: ["Shift", "S"], label: "Send this mix" },
  { keys: ["Shift", "Alt", "T"], label: "Sleep timer" },
  { keys: ["Shift", "C"], label: "Countdown" },
  { keys: ["Shift", "P"], label: "Pomodoro" },
  { keys: ["Shift", "N"], label: "Notepad" },
  { keys: ["Shift", "T"], label: "Checklist" },
  { keys: ["Shift", "B"], label: "Breathing" },
  { keys: ["Shift", "G"], label: "Levels" },
  { keys: ["Shift", "H"], label: "This list" },
];

export function ShortcutsModal({ onClose, show }: ShortcutsModalProps) {
  const shortcuts = useSettingsStore((state) => state.shortcuts);
  const setShortcuts = useSettingsStore((state) => state.setShortcuts);

  return (
    <ToolPanel show={show} title="Keyboard" onClose={onClose}>
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm">
          <span className="block font-medium">Use these shortcuts</span>
          <span className="text-muted-foreground block">
            Off if they get in the way of a screen reader or voice control.
          </span>
        </span>
        <Switch
          aria-label="Use keyboard shortcuts"
          checked={shortcuts}
          onCheckedChange={setShortcuts}
        />
      </label>

      <ul
        className={cn(
          "divide-border divide-y transition-opacity",
          !shortcuts && "opacity-55",
        )}
      >
        {SHORTCUTS.map((shortcut) => (
          <li
            className="flex items-center justify-between gap-4 py-3"
            key={shortcut.label}
          >
            <span className="text-sm">{shortcut.label}</span>
            <span className="flex items-center gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  className="bg-muted text-muted-foreground rounded-sm px-2 py-1 font-sans text-xs font-medium"
                  key={key}
                >
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </ToolPanel>
  );
}
