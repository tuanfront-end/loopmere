"use client";

import { ShuffleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { useSoundStore } from "@/stores/sound";

/** The hero keeps it filled; the rail hands the brand to the button below it. */
export function ShuffleButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "outline";
}) {
  const shuffle = useSoundStore((state) => state.shuffle);

  return (
    <Button className={className} size="lg" variant={variant} onClick={shuffle}>
      <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
      Build me a mix
    </Button>
  );
}
