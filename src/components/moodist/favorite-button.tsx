"use client";

import { BiHeart, BiSolidHeart } from "react-icons/bi";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSoundStore } from "@/stores/sound";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  id: string;
  label: string;
}

export function FavoriteButton({ id, label }: FavoriteButtonProps) {
  const isFavorite = useSoundStore((state) => state.sounds[id].isFavorite);
  const toggleFavorite = useSoundStore((state) => state.toggleFavorite);

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={
          isFavorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`
        }
        className={cn(
          "absolute top-2 right-2 grid size-7 place-items-center rounded-full text-sm",
          "text-muted-foreground/60 transition-colors",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          isFavorite && "text-rose-500 hover:text-rose-500",
        )}
        onClick={(e) => {
          // The whole card is a button; don't toggle the sound on a heart click.
          e.stopPropagation();
          toggleFavorite(id);
        }}
      >
        {isFavorite ? <BiSolidHeart /> : <BiHeart />}
      </TooltipTrigger>
      <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
    </Tooltip>
  );
}
