"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

interface PauseButtonProps {
  className?: string;
  id: string;
  label: string;
}

/**
 * Quietens one sound without taking it out of the mix.
 *
 * Before this the card's only state was in or out, so the way to silence a
 * single loop was to remove it — which also threw away the level it had been
 * set to, and there was no way back to it but by ear.
 */
export function PauseButton({ className, id, label }: PauseButtonProps) {
  const isPaused = useSoundStore((state) => state.sounds[id].isPaused);
  const togglePause = useSoundStore((state) => state.togglePause);

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={isPaused ? `Bring ${label} back` : `Quieten ${label}`}
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground grid size-9 place-items-center rounded-sm transition-colors",
          className,
        )}
        onClick={(event) => {
          // The card itself adds and removes; this one only silences.
          event.stopPropagation();
          togglePause(id);
        }}
      >
        {isPaused ? (
          <PlayIcon className="size-4" />
        ) : (
          <PauseIcon className="size-4" />
        )}
      </TooltipTrigger>
      <TooltipContent>{isPaused ? "Bring it back" : "Quieten"}</TooltipContent>
    </Tooltip>
  );
}
