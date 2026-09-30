import Image from "next/image";

import { thiingsIcons } from "@/data/sound-thiings";

interface SoundIconProps {
  id: string;
  /**
   * Lazy by default, which is right for a card down the page. Chrome pinned
   * to the screen passes `eager`: a lazy image in the phone's fixed player
   * never started loading when the mix was restored on a reload.
   */
  loading?: "eager" | "lazy";
  size?: number;
}

export function SoundIcon({ id, loading, size = 26 }: SoundIconProps) {
  const src = thiingsIcons[id];

  if (!src) return null;

  return (
    <Image
      alt=""
      className="object-contain"
      height={size * 2}
      loading={loading}
      src={src}
      style={{ height: size, width: size }}
      width={size * 2}
    />
  );
}
