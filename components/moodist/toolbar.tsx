"use client";

import {
  Cancel01Icon,
  Menu01Icon,
  ShuffleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ScrollToTop } from "./scroll-to-top";
import { TOOL_GROUPS, useTools } from "./tools-provider";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  drawerRow,
} from "@/components/ui/drawer";
import { useSoundStore } from "@/stores/sound";

/**
 * The tools, for the widths with no right rail to put them in. Above `xl` the
 * rail carries the same list with room to label it, so this button goes away
 * rather than becoming a second door to the same thirteen panels.
 *
 * A sheet rather than a menu. A dropdown anchored to a button in the bottom
 * corner opens upward into whatever happens to be there, gets a scrollbar at
 * `max-h-[70dvh]`, and puts thirteen 32px rows within a thumb's reach of the
 * screen edge. A sheet starts at the edge the thumb is already at, says what
 * it is, and can be thrown shut without aiming at anything.
 */
export function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { open } = useTools();
  const shuffle = useSoundStore((state) => state.shuffle);
  const noSelected = useSoundStore((state) => state.noSelected());

  useHotkeys("shift+m", () => setIsOpen((previous) => !previous));

  return (
    <div className="fixed right-6 bottom-6 z-40 flex items-center gap-2 xl:hidden">
      <ScrollToTop />

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger
          render={
            <Button aria-label="Tools" className="shadow-soft" size="icon">
              <HugeiconsIcon
                icon={isOpen ? Cancel01Icon : Menu01Icon}
                strokeWidth={1.5}
              />
            </Button>
          }
        />

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Tools</DrawerTitle>
            <DrawerDescription>
              Timers, notes and the things that make a mix. Everything here
              keeps playing behind it.
            </DrawerDescription>
          </DrawerHeader>

          <button
            className={drawerRow}
            onClick={() => {
              setIsOpen(false);
              shuffle();
            }}
          >
            <HugeiconsIcon
              className="size-4 shrink-0"
              icon={ShuffleIcon}
              strokeWidth={1.5}
            />
            Build me a mix
          </button>

          <div className="mt-5 flex flex-col gap-5">
            {TOOL_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-muted-foreground px-2.5 text-xs">
                  {group.title}
                </p>

                <div className="mt-1 flex flex-col gap-1">
                  {group.tools.map((tool) => (
                    <button
                      className={drawerRow}
                      disabled={tool.name === "shareLink" && noSelected}
                      key={tool.name}
                      onClick={() => {
                        setIsOpen(false);
                        open(tool.name);
                      }}
                    >
                      <HugeiconsIcon
                        className="size-4 shrink-0"
                        icon={tool.icon}
                        strokeWidth={1.5}
                      />
                      {tool.label}
                      {tool.shortcut && (
                        <span className="text-muted-foreground ml-auto text-xs tracking-widest">
                          {tool.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
