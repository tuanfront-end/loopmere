"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import {
  Delete02Icon,
  ShuffleIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSoundStore } from "@/stores/sound";

export function PlayControls() {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const noSelected = useSoundStore((state) => state.noSelected());
  const shuffle = useSoundStore((state) => state.shuffle);
  const unselectAll = useSoundStore((state) => state.unselectAll);
  const restoreHistory = useSoundStore((state) => state.restoreHistory);
  const hasHistory = useSoundStore((state) => !!state.history);

  return (
    /* Not sticky any more. The header is, and it carries play, pause and the
       count of what is in the mix — two pills fighting for the top of the
       screen is what this was before. The full set stays here in flow: shuffle,
       undo and clear are decisions made at the mixing desk, not mid-scroll. */
    <div className="flex justify-center">
      {/* Floating, so a cast rather than an edge — and the ring is in the token. */}
      <div className="bg-card/85 shadow-soft-lg flex items-center gap-1 rounded-full p-1.5 backdrop-blur">
        <Button disabled={noSelected} onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Pick four sounds at random"
                size="icon"
                variant="ghost"
                onClick={shuffle}
              >
                <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              </Button>
            }
          />
          <TooltipContent>Surprise me</TooltipContent>
        </Tooltip>

        {hasHistory ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Bring the last mix back"
                  size="icon"
                  variant="ghost"
                  onClick={restoreHistory}
                >
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.5} />
                </Button>
              }
            />
            <TooltipContent>Bring it back</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Clear every sound"
                  disabled={noSelected}
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    unselectAll(true);
                    toast("Mix cleared.", {
                      action: { label: "Undo", onClick: restoreHistory },
                    });
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                </Button>
              }
            />
            <TooltipContent>Clear the mix</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
