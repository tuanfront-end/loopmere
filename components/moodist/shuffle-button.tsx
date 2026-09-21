"use client";

import { ShuffleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { useSoundStore } from "@/stores/sound";

export function ShuffleButton() {
  const shuffle = useSoundStore((state) => state.shuffle);

  return (
    <Button size="lg" onClick={shuffle}>
      <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
      Build me a mix
    </Button>
  );
}
