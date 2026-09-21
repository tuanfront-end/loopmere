"use client";

import { BiShuffle } from "react-icons/bi";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdRestore } from "react-icons/md";
import { TbTrash } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
    <div className="sticky top-4 z-10 flex justify-center">
      <div className="bg-card/80 flex items-center gap-1 rounded-full border p-1 shadow-sm backdrop-blur">
        <Button
          className="rounded-full"
          disabled={noSelected}
          size="sm"
          onClick={togglePlay}
        >
          {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Shuffle sounds"
              className="rounded-full"
              size="icon-sm"
              variant="ghost"
              onClick={shuffle}
            >
              <BiShuffle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Shuffle</TooltipContent>
        </Tooltip>

        {hasHistory ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Restore the previous mix"
                className="rounded-full"
                size="icon-sm"
                variant="ghost"
                onClick={restoreHistory}
              >
                <MdRestore />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Clear all selected sounds"
                className="rounded-full"
                disabled={noSelected}
                size="icon-sm"
                variant="ghost"
                onClick={() => unselectAll(true)}
              >
                <TbTrash />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear all</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
