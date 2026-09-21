import Image from "next/image";

import { thiingsIcons } from "@/data/sound-thiings";

interface SoundIconProps {
  id: string;
  size?: number;
}

export function SoundIcon({ id, size = 26 }: SoundIconProps) {
  const src = thiingsIcons[id];

  if (!src) return null;

  return (
    <Image
      alt=""
      className="object-contain"
      height={size * 2}
      src={src}
      style={{ height: size, width: size }}
      width={size * 2}
    />
  );
}
