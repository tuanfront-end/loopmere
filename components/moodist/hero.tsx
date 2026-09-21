import Image from "next/image";

import { NowPlaying } from "./now-playing";
import { ShuffleButton } from "./shuffle-button";

import { sounds } from "@/data/sounds";
import { count } from "@/lib/sounds";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-16 sm:px-8 sm:pt-24">
      <div className="text-center">
        <h1 className="mx-auto max-w-[19ch] text-4xl tracking-tighter text-balance sm:text-6xl">
          Rain on a tent, a train at night, a room full of typing
        </h1>
      </div>

      <p className="text-muted-foreground mx-auto mt-6 max-w-[58ch] text-center text-base">
        {count()} loops you can stack and level to taste. Nothing to sign up
        for, and the mix you built is still here tomorrow.
      </p>

      <div className="mt-8 flex justify-center">
        <ShuffleButton />
      </div>

      {/* The one saturated moment on the page, and the product sits on top of it. */}
      <div className="relative mt-16 overflow-hidden rounded-lg">
        <Image
          alt="A grass bank running up to a sky of tall cumulus, late in the day"
          className="h-[300px] w-full object-cover sm:h-[420px]"
          height={800}
          priority
          src="/images/hero-background.webp"
          width={1600}
        />

        <div className="bg-card/90 shadow-soft-lg absolute bottom-4 left-4 max-w-[min(20rem,calc(100%-2rem))] rounded-lg p-4 backdrop-blur sm:bottom-6 sm:left-6">
          <NowPlaying />
        </div>

        <div className="bg-card/90 shadow-soft-lg absolute top-4 right-4 rounded-full px-4 py-2 sm:top-6 sm:right-6">
          <p className="text-xs font-medium tabular-nums">
            {count()} loops, {sounds.categories.length} sets
          </p>
        </div>
      </div>
    </section>
  );
}
