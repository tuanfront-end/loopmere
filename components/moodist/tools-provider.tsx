"use client";

import {
  AudioWave01Icon,
  CheckListIcon,
  Clock01Icon,
  KeyboardIcon,
  MusicNote01Icon,
  Settings02Icon,
  Share01Icon,
  SleepingIcon,
  SparklesIcon,
  StickyNote01Icon,
  Timer01Icon,
  WindIcon,
} from "@hugeicons/core-free-icons";
import dynamic from "next/dynamic";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

import { useCloseListener } from "@/hooks/use-close-listener";
import { closeModals } from "@/lib/modal";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

/*
 * The thirteen panels, each its own chunk. None is on screen until somebody
 * opens it, and imported up front they were a fifth of the first load —
 * 74 KB gzipped, 40 of it motion for the breathing circle alone.
 *
 * Deferred, not changed: `ToolsProvider` mounts them all, closed, once the
 * browser is idle after load, so by the time anyone reaches for one it is
 * already mounted — the same state as before, minus the bytes on the critical
 * path. A panel opened sooner than that mounts on the spot.
 */
const PresetsModal = dynamic(
  () => import("./modals/presets").then((mod) => mod.PresetsModal),
  { ssr: false },
);
const ShareLinkModal = dynamic(
  () => import("./modals/share-link").then((mod) => mod.ShareLinkModal),
  { ssr: false },
);
const SleepTimerModal = dynamic(
  () => import("./modals/sleep-timer").then((mod) => mod.SleepTimerModal),
  { ssr: false },
);
const Countdown = dynamic(
  () => import("./tools/countdown").then((mod) => mod.Countdown),
  { ssr: false },
);
const Pomodoro = dynamic(
  () => import("./tools/pomodoro").then((mod) => mod.Pomodoro),
  { ssr: false },
);
const Notepad = dynamic(
  () => import("./tools/notepad").then((mod) => mod.Notepad),
  { ssr: false },
);
const Todo = dynamic(() => import("./tools/todo").then((mod) => mod.Todo), {
  ssr: false,
});
const BreathingModal = dynamic(
  () => import("./modals/breathing").then((mod) => mod.BreathingModal),
  { ssr: false },
);
const ToneModal = dynamic(
  () => import("./modals/tone-modal").then((mod) => mod.ToneModal),
  { ssr: false },
);
const LofiModal = dynamic(
  () => import("./modals/lofi").then((mod) => mod.LofiModal),
  { ssr: false },
);
const SettingsModal = dynamic(
  () => import("./modals/settings").then((mod) => mod.SettingsModal),
  { ssr: false },
);
const ShortcutsModal = dynamic(
  () => import("./modals/shortcuts").then((mod) => mod.ShortcutsModal),
  { ssr: false },
);

export type PanelName =
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

export interface Tool {
  icon: typeof SparklesIcon;
  label: string;
  name: PanelName;
  shortcut?: string;
}

/**
 * Ordered as they appear, grouped by the rule drawn between them. The right
 * rail draws the same four groups the floating menu does, so the two cannot
 * drift into different ideas about what a tool is.
 */
export const TOOL_GROUPS: Array<{ title: string; tools: Array<Tool> }> = [
  {
    title: "The mix",
    tools: [
      {
        icon: SparklesIcon,
        label: "Presets",
        name: "presets",
        shortcut: "⇧⌥P",
      },
      {
        icon: Share01Icon,
        label: "Send this mix",
        name: "shareLink",
        shortcut: "⇧S",
      },
      {
        icon: SleepingIcon,
        label: "Sleep timer",
        name: "sleepTimer",
        shortcut: "⇧⌥T",
      },
    ],
  },
  {
    title: "While it plays",
    tools: [
      {
        icon: Timer01Icon,
        label: "Countdown",
        name: "countdown",
        shortcut: "⇧C",
      },
      {
        icon: Clock01Icon,
        label: "Pomodoro",
        name: "pomodoro",
        shortcut: "⇧P",
      },
      {
        icon: StickyNote01Icon,
        label: "Notepad",
        name: "notepad",
        shortcut: "⇧N",
      },
      { icon: CheckListIcon, label: "Checklist", name: "todo", shortcut: "⇧T" },
      { icon: WindIcon, label: "Breathing", name: "breathing", shortcut: "⇧B" },
    ],
  },
  {
    title: "Generated",
    tools: [
      { icon: AudioWave01Icon, label: "Binaural beat", name: "binaural" },
      { icon: AudioWave01Icon, label: "Isochronic tone", name: "isochronic" },
      { icon: MusicNote01Icon, label: "Lofi radio", name: "lofi" },
    ],
  },
  {
    title: "This app",
    tools: [
      {
        icon: Settings02Icon,
        label: "Levels",
        name: "settings",
        shortcut: "⇧G",
      },
      {
        icon: KeyboardIcon,
        label: "Keyboard",
        name: "shortcuts",
        shortcut: "⇧H",
      },
    ],
  },
];

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

const ToolsContext = createContext<{ open: (name: PanelName) => void } | null>(
  null,
);

export function useTools() {
  const value = use(ToolsContext);

  if (!value) throw new Error("useTools must be used inside ToolsProvider");

  return value;
}

/**
 * Owns the thirteen panels and every shortcut that opens one, so a trigger is
 * a button with a name rather than a component with state. The rails and the
 * floating menu are three triggers on one set of panels.
 */
export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [panels, setPanels] = useState<Record<PanelName, boolean>>(CLOSED);

  /** Every panel mounted, closed — true once the browser is idle after load. */
  const [ready, setReady] = useState(false);
  /** The panels opened before that, which mount on the spot instead. */
  const [seen, setSeen] = useState<Partial<Record<PanelName, true>>>({});

  useEffect(() => {
    const mount = () => setReady(true);

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(mount, { timeout: 3000 });

      return () => cancelIdleCallback(id);
    }

    const id = setTimeout(mount, 1500);

    return () => clearTimeout(id);
  }, []);

  const mounted = (name: PanelName) => ready || Boolean(seen[name]);

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
      closeModals();
      setSeen((previous) =>
        previous[name] ? previous : { ...previous, [name]: true },
      );
      setPanels((previous) => ({ ...previous, [name]: true }));
    },
    [closeAll],
  );

  useCloseListener(closeAll);

  /** Off from the Keyboard panel — see `shortcuts` in the settings store. */
  const enabled = useSettingsStore((state) => state.shortcuts);

  /**
   * A whole mix gone from one keystroke, with nothing on screen to say so
   * and no way back but rebuilding it. `unselectAll(true)` already keeps the
   * mix it clears, so the toast offers it back.
   */
  const clearMix = useCallback(() => {
    if (useSoundStore.getState().noSelected()) return;

    unselectAll(true);
    toast("Cleared the mix.", {
      action: {
        label: "Undo",
        onClick: () => useSoundStore.getState().restoreHistory(),
      },
    });
  }, [unselectAll]);

  useHotkeys("shift+space", togglePlay, { enabled: enabled && !noSelected });
  useHotkeys("shift+r", clearMix, { enabled });
  useHotkeys("shift+alt+p", () => open("presets"), { enabled });
  useHotkeys("shift+s", () => open("shareLink"), {
    enabled: enabled && !noSelected,
  });
  useHotkeys("shift+alt+t", () => open("sleepTimer"), { enabled });
  useHotkeys("shift+c", () => open("countdown"), { enabled });
  useHotkeys("shift+p", () => open("pomodoro"), { enabled });
  useHotkeys("shift+n", () => open("notepad"), { enabled });
  useHotkeys("shift+t", () => open("todo"), { enabled });
  useHotkeys("shift+b", () => open("breathing"), { enabled });
  useHotkeys("shift+g", () => open("settings"), { enabled });
  useHotkeys("shift+h", () => open("shortcuts"), { enabled });

  const value = useMemo(() => ({ open }), [open]);

  return (
    <ToolsContext value={value}>
      {children}

      {mounted("presets") && (
        <PresetsModal show={panels.presets} onClose={() => close("presets")} />
      )}
      {mounted("shareLink") && (
        <ShareLinkModal
          show={panels.shareLink}
          onClose={() => close("shareLink")}
        />
      )}
      {mounted("sleepTimer") && (
        <SleepTimerModal
          show={panels.sleepTimer}
          onClose={() => close("sleepTimer")}
        />
      )}
      {mounted("countdown") && (
        <Countdown show={panels.countdown} onClose={() => close("countdown")} />
      )}
      {mounted("pomodoro") && (
        <Pomodoro
          open={() => open("pomodoro")}
          show={panels.pomodoro}
          onClose={() => close("pomodoro")}
        />
      )}
      {mounted("notepad") && (
        <Notepad show={panels.notepad} onClose={() => close("notepad")} />
      )}
      {mounted("todo") && (
        <Todo show={panels.todo} onClose={() => close("todo")} />
      )}
      {mounted("breathing") && (
        <BreathingModal
          show={panels.breathing}
          onClose={() => close("breathing")}
        />
      )}
      {mounted("binaural") && (
        <ToneModal
          kind="binaural"
          show={panels.binaural}
          onClose={() => close("binaural")}
        />
      )}
      {mounted("isochronic") && (
        <ToneModal
          kind="isochronic"
          show={panels.isochronic}
          onClose={() => close("isochronic")}
        />
      )}
      {mounted("lofi") && (
        <LofiModal show={panels.lofi} onClose={() => close("lofi")} />
      )}
      {mounted("settings") && (
        <SettingsModal
          show={panels.settings}
          onClose={() => close("settings")}
        />
      )}
      {mounted("shortcuts") && (
        <ShortcutsModal
          show={panels.shortcuts}
          onClose={() => close("shortcuts")}
        />
      )}
    </ToolsContext>
  );
}
