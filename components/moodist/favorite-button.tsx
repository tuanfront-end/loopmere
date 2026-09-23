"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

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
          isFavorite
            ? `Remove ${label} from favourites`
            : `Save ${label} to favourites`
        }
        // Radius matches `buttonVariants` by hand, because this is a
        // TooltipTrigger rather than a Button — the trigger owns the element.
        // If a third control ends up in this shape, it becomes a variant.
        className={cn(
          "grid size-9 place-items-center rounded-sm transition-colors",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          isFavorite && "text-coral-ink hover:text-coral-ink",
        )}
        onClick={() => toggleFavorite(id)}
      >
        <HugeiconsIcon
          className={cn("size-4", isFavorite && "fill-coral/40")}
          icon={FavouriteIcon}
          strokeWidth={1.5}
        />
      </TooltipTrigger>
      <TooltipContent>
        {isFavorite ? "Remove from favourites" : "Save to favourites"}
      </TooltipContent>
    </Tooltip>
  );
}
