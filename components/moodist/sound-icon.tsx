"use client";

import Image from "next/image";

import { useIconSet } from "@/components/dev/icon-set";
import { phosphorIcons } from "@/data/sound-icons";
import { thiingsIcons } from "@/data/sound-thiings";

interface SoundIconProps {
  id: string;
  /** Drawn at the icon disc's size; the 3D renders need the extra room. */
  size?: number;
}

export function SoundIcon({ id, size = 20 }: SoundIconProps) {
  const { set } = useIconSet();

  const thiing = thiingsIcons[id];

  if (set === "thiings" && thiing) {
    return (
      <Image
        alt=""
        className="object-contain"
        height={size * 2}
        src={thiing}
        width={size * 2}
        style={{ height: size * 2, width: size * 2 }}
      />
    );
  }

  return (
    <span aria-hidden="true" style={{ fontSize: size }}>
      {phosphorIcons[id] ?? phosphorIcons.noise}
    </span>
  );
}
