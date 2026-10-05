"use client";

import { DashedLine01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

interface OccasionalButtonProps {
  className?: string;
  id: string;
  label: string;
}

/**
 * Lets a single happening — thunder, an owl, a bell — come now and then
 * instead of on a loop: it plays through, then rests half a minute to three
 * before it plays again. Drawn only for sounds marked `event`; on a bed of
 * rain or traffic a rest would only read as a dropout.
 *
 * Swell's shape and states, beside it in the mix desk, since both are ways a
 * sound in the mix moves on its own.
 */
export function OccasionalButton({
  className,
  id,
  label,
}: OccasionalButtonProps) {
  const isOccasional = useSoundStore(
    (state) => state.sounds[id].isOccasional,
  );
  const toggleOccasional = useSoundStore((state) => state.toggleOccasional);

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`${label} now and then`}
        aria-pressed={isOccasional}
        className={cn(
          "grid size-9 place-items-center rounded-sm transition-colors",
          isOccasional
            ? "bg-primary/20 text-primary-ink hover:bg-primary/30"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
        onClick={() => toggleOccasional(id)}
      >
        <HugeiconsIcon
          className="size-4"
          icon={DashedLine01Icon}
          strokeWidth={1.5}
        />
      </TooltipTrigger>
      <TooltipContent>
        {isOccasional ? "Keep it going" : "Now and then"}
      </TooltipContent>
    </Tooltip>
  );
}
