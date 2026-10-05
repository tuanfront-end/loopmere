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
  /**
   * On a card, a press on a sound out of the mix brings it in, swelling: the
   * card's rule for its slider, where reaching for a control is a way in.
   */
  startsSound?: boolean;
}

/**
 * Lets one sound's level rise and fall on a slow wave of its own, so a loop
 * that holds still reads less like a loop. From Moodist 3.1, where it appears
 * under the card with the pick and changes the card's height. Here it is
 * always drawn: beside the heart on the card, and at the end of the level it
 * moves in the mix desk.
 *
 * A toggle, so the name holds still and `aria-pressed` carries the state.
 */
export function SwellButton({
  className,
  id,
  label,
  startsSound = false,
}: SwellButtonProps) {
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
        onClick={() => {
          const { locked, play, select, sounds } = useSoundStore.getState();

          if (!startsSound || sounds[id].isSelected) {
            toggleSwell(id);
            return;
          }

          if (locked) return;

          select(id);
          play();
          if (!sounds[id].isSwelling) toggleSwell(id);
        }}
      >
        <HugeiconsIcon className="size-4" icon={Sine02Icon} strokeWidth={1.5} />
      </TooltipTrigger>
      <TooltipContent>{isSwelling ? "Hold steady" : "Swell"}</TooltipContent>
    </Tooltip>
  );
}
