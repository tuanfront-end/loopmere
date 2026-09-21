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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSoundStore } from "@/stores/sound";

/**
 * The tools, for the widths with no right rail to put them in. Above `xl` the
 * rail carries the same list with room to label it, so this button goes away
 * rather than becoming a second door to the same thirteen panels.
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
          className="no-scrollbar max-h-[70dvh] min-w-56 overflow-y-auto"
          side="top"
          sideOffset={12}
        >
          <DropdownMenuItem onClick={shuffle}>
            <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
            Build me a mix
          </DropdownMenuItem>

          {TOOL_GROUPS.map((group) => (
            <DropdownMenuGroup key={group.title}>
              <DropdownMenuSeparator />
              {group.tools.map((tool) => (
                <DropdownMenuItem
                  disabled={tool.name === "shareLink" && noSelected}
                  key={tool.name}
                  onClick={() => {
                    setIsOpen(false);
                    open(tool.name);
                  }}
                >
                  <HugeiconsIcon icon={tool.icon} strokeWidth={1.5} />
                  {tool.label}
                  {tool.shortcut && (
                    <DropdownMenuShortcut>{tool.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
