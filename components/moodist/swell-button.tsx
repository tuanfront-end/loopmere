"use client";

import { Sine02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

interface SwellButtonProps {
  className?: string;
  id: string;
  label: string;
}

/**
 * Lets one sound's level rise and fall on a slow wave of its own, so a loop
 * that holds still reads less like a loop. From Moodist 3.1, where it sits
 * under the card and appears with the pick; here it sits at the end of the
 * level it moves, in the mix desk, so no card changes height for it.
 *
 * A toggle, so the name holds still and `aria-pressed` carries the state.
 */
export function SwellButton({ className, id, label }: SwellButtonProps) {
  const isSwelling = useSoundStore((state) => state.sounds[id].isSwelling);
  const toggleSwell = useSoundStore((state) => state.toggleSwell);

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`Swell ${label}`}
        aria-pressed={isSwelling}
        className={cn(
          "grid size-9 place-items-center rounded-sm transition-colors",
          // On is a brand tint, not `bg-accent`: that measures 1.02 against
          // the white row, and the state would rest on the glyph's ink alone.
          isSwelling
            ? "bg-primary/20 text-primary-ink hover:bg-primary/30"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
        onClick={() => toggleSwell(id)}
      >
        <HugeiconsIcon className="size-4" icon={Sine02Icon} strokeWidth={2} />
      </TooltipTrigger>
      <TooltipContent>{isSwelling ? "Hold steady" : "Swell"}</TooltipContent>
    </Tooltip>
  );
}
