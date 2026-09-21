"use client";

import {
  Cancel01Icon,
  CheckListIcon,
  Clock01Icon,
  Menu01Icon,
  ShuffleIcon,
  StickyNote01Icon,
  Timer01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

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

type PanelName = "countdown" | "notepad" | "pomodoro" | "todo";

const CLOSED: Record<PanelName, boolean> = {
  countdown: false,
  notepad: false,
  pomodoro: false,
  todo: false,
};

export function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [panels, setPanels] = useState(CLOSED);

  const shuffle = useSoundStore((state) => state.shuffle);

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
  useHotkeys("shift+c", () => open("countdown"));
  useHotkeys("shift+p", () => open("pomodoro"));
  useHotkeys("shift+n", () => open("notepad"));
  useHotkeys("shift+t", () => open("todo"));

  const items = useMemo(
    () =>
      [
        {
          icon: Timer01Icon,
          label: "Countdown",
          name: "countdown" as const,
          shortcut: "⇧C",
        },
        {
          icon: Clock01Icon,
          label: "Pomodoro",
          name: "pomodoro" as const,
          shortcut: "⇧P",
        },
        {
          icon: StickyNote01Icon,
          label: "Notepad",
          name: "notepad" as const,
          shortcut: "⇧N",
        },
        {
          icon: CheckListIcon,
          label: "Checklist",
          name: "todo" as const,
          shortcut: "⇧T",
        },
      ],
    [],
  );

  return (
    <>
      <div className="fixed right-6 bottom-6 z-40 flex items-center gap-2">
        <ScrollToTop />

        <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Tools" className="shadow-soft" size="icon">
              <HugeiconsIcon
                icon={isOpen ? Cancel01Icon : Menu01Icon}
                strokeWidth={1.5}
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" sideOffset={12}>
            <DropdownMenuItem onClick={shuffle}>
              <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              Build me a mix
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {items.map((item) => (
              <DropdownMenuItem key={item.name} onClick={() => open(item.name)}>
                <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                {item.label}
                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Countdown show={panels.countdown} onClose={() => close("countdown")} />
      <Pomodoro
        open={() => open("pomodoro")}
        show={panels.pomodoro}
        onClose={() => close("pomodoro")}
      />
      <Notepad show={panels.notepad} onClose={() => close("notepad")} />
      <Todo show={panels.todo} onClose={() => close("todo")} />
    </>
  );
}
