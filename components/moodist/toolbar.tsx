"use client";

import {
  AudioWave01Icon,
  Cancel01Icon,
  CheckListIcon,
  Clock01Icon,
  KeyboardIcon,
  Menu01Icon,
  MusicNote01Icon,
  Settings02Icon,
  Share01Icon,
  ShuffleIcon,
  SleepingIcon,
  SparklesIcon,
  StickyNote01Icon,
  Timer01Icon,
  WindIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { BreathingModal } from "./modals/breathing";
import { LofiModal } from "./modals/lofi";
import { PresetsModal } from "./modals/presets";
import { SettingsModal } from "./modals/settings";
import { ShareLinkModal } from "./modals/share-link";
import { ShortcutsModal } from "./modals/shortcuts";
import { SleepTimerModal } from "./modals/sleep-timer";
import { ToneModal } from "./modals/tone-modal";
import { ScrollToTop } from "./scroll-to-top";
import { Countdown } from "./tools/countdown";
import { Notepad } from "./tools/notepad";
import { Pomodoro } from "./tools/pomodoro";
import { Todo } from "./tools/todo";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCloseListener } from "@/hooks/use-close-listener";
import { closeModals } from "@/lib/modal";
import { useSoundStore } from "@/stores/sound";

type PanelName =
  | "binaural"
  | "breathing"
  | "countdown"
  | "isochronic"
  | "lofi"
  | "notepad"
  | "pomodoro"
  | "presets"
  | "settings"
  | "shareLink"
  | "shortcuts"
  | "sleepTimer"
  | "todo";

const CLOSED = {
  binaural: false,
  breathing: false,
  countdown: false,
  isochronic: false,
  lofi: false,
  notepad: false,
  pomodoro: false,
  presets: false,
  settings: false,
  shareLink: false,
  shortcuts: false,
  sleepTimer: false,
  todo: false,
} satisfies Record<PanelName, boolean>;

/** Ordered as they appear, grouped by the separators between them. */
const GROUPS: Array<
  Array<{
    icon: typeof ShuffleIcon;
    label: string;
    name: PanelName;
    shortcut?: string;
  }>
> = [
  [
    { icon: SparklesIcon, label: "Presets", name: "presets", shortcut: "⇧⌥P" },
    { icon: Share01Icon, label: "Send this mix", name: "shareLink", shortcut: "⇧S" },
    { icon: SleepingIcon, label: "Sleep timer", name: "sleepTimer", shortcut: "⇧⌥T" },
  ],
  [
    { icon: Timer01Icon, label: "Countdown", name: "countdown", shortcut: "⇧C" },
    { icon: Clock01Icon, label: "Pomodoro", name: "pomodoro", shortcut: "⇧P" },
    { icon: StickyNote01Icon, label: "Notepad", name: "notepad", shortcut: "⇧N" },
    { icon: CheckListIcon, label: "Checklist", name: "todo", shortcut: "⇧T" },
    { icon: WindIcon, label: "Breathing", name: "breathing", shortcut: "⇧B" },
  ],
  [
    { icon: AudioWave01Icon, label: "Binaural beat", name: "binaural" },
    { icon: AudioWave01Icon, label: "Isochronic tone", name: "isochronic" },
    { icon: MusicNote01Icon, label: "Lofi radio", name: "lofi" },
  ],
  [
    { icon: Settings02Icon, label: "Levels", name: "settings", shortcut: "⇧G" },
    { icon: KeyboardIcon, label: "Keyboard", name: "shortcuts", shortcut: "⇧H" },
  ],
];

export function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [panels, setPanels] = useState<Record<PanelName, boolean>>(CLOSED);

  const shuffle = useSoundStore((state) => state.shuffle);
  const noSelected = useSoundStore((state) => state.noSelected());
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const unselectAll = useSoundStore((state) => state.unselectAll);

  const closeAll = useCallback(() => setPanels(CLOSED), []);

  const close = useCallback(
    (name: PanelName) =>
      setPanels((previous) => ({ ...previous, [name]: false })),
    [],
  );

  /** One panel at a time: opening any of them closes whatever was up. */
  const open = useCallback(
    (name: PanelName) => {
      closeAll();
      setIsOpen(false);
      closeModals();
      setPanels((previous) => ({ ...previous, [name]: true }));
    },
    [closeAll],
  );

  useCloseListener(closeAll);

  useHotkeys("shift+m", () => setIsOpen((previous) => !previous));
  useHotkeys("shift+space", togglePlay, { enabled: !noSelected });
  useHotkeys("shift+r", () => unselectAll(true));
  useHotkeys("shift+alt+p", () => open("presets"));
  useHotkeys("shift+s", () => open("shareLink"), { enabled: !noSelected });
  useHotkeys("shift+alt+t", () => open("sleepTimer"));
  useHotkeys("shift+c", () => open("countdown"));
  useHotkeys("shift+p", () => open("pomodoro"));
  useHotkeys("shift+n", () => open("notepad"));
  useHotkeys("shift+t", () => open("todo"));
  useHotkeys("shift+b", () => open("breathing"));
  useHotkeys("shift+g", () => open("settings"));
  useHotkeys("shift+h", () => open("shortcuts"));

  return (
    <>
      <div className="fixed right-6 bottom-6 z-40 flex items-center gap-2">
        <ScrollToTop />

        <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            render={
            <Button aria-label="Tools" className="shadow-soft" size="icon">
              <HugeiconsIcon
                icon={isOpen ? Cancel01Icon : Menu01Icon}
                strokeWidth={1.5}
              />
            </Button>
            }
          />

          <DropdownMenuContent
            align="end"
            className="no-scrollbar max-h-[70dvh] overflow-y-auto"
            side="top"
            sideOffset={12}
          >
            <DropdownMenuItem onClick={shuffle}>
              <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              Build me a mix
            </DropdownMenuItem>

            {GROUPS.map((group, index) => (
              <div key={index}>
                <DropdownMenuSeparator />
                {group.map((item) => (
                  <DropdownMenuItem
                    disabled={item.name === "shareLink" && noSelected}
                    key={item.name}
                    onClick={() => open(item.name)}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                    {item.label}
                    {item.shortcut && (
                      <DropdownMenuShortcut>
                        {item.shortcut}
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PresetsModal show={panels.presets} onClose={() => close("presets")} />
      <ShareLinkModal
        show={panels.shareLink}
        onClose={() => close("shareLink")}
      />
      <SleepTimerModal
        show={panels.sleepTimer}
        onClose={() => close("sleepTimer")}
      />
      <Countdown show={panels.countdown} onClose={() => close("countdown")} />
      <Pomodoro
        open={() => open("pomodoro")}
        show={panels.pomodoro}
        onClose={() => close("pomodoro")}
      />
      <Notepad show={panels.notepad} onClose={() => close("notepad")} />
      <Todo show={panels.todo} onClose={() => close("todo")} />
      <BreathingModal
        show={panels.breathing}
        onClose={() => close("breathing")}
      />
      <ToneModal
        kind="binaural"
        show={panels.binaural}
        onClose={() => close("binaural")}
      />
      <ToneModal
        kind="isochronic"
        show={panels.isochronic}
        onClose={() => close("isochronic")}
      />
      <LofiModal show={panels.lofi} onClose={() => close("lofi")} />
      <SettingsModal show={panels.settings} onClose={() => close("settings")} />
      <ShortcutsModal
        show={panels.shortcuts}
        onClose={() => close("shortcuts")}
      />
    </>
  );
}
