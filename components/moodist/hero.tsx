import Image from "next/image";

import { NowPlaying } from "./now-playing";
import { ShuffleButton } from "./shuffle-button";

import { sounds } from "@/data/sounds";
import { count } from "@/lib/sounds";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-10 sm:px-8 sm:pt-14 xl:pt-8">
      {/* Two columns from `@xl`, and the breakpoint is the *centre column's*
          rather than the window's — with a rail on each side the viewport
          stopped being what decides this, the same reason the sound grid reads
          its container.

          The order in the markup is the order it stacks in: heading, then the
          line that explains it, then the button. Laying it out as two plain
          columns would have put the button above the explanation on a phone,
          which is the arrangement nobody wants and the one a two-column grid
          gives you for free. So the placement is explicit and only the wide
          case is told anything. */}
      <div className="@xl:grid @xl:grid-cols-[1.15fr_1fr] @xl:items-end @xl:gap-x-12">
        <h1 className="max-w-[22ch] text-3xl tracking-tighter text-balance @xl:col-start-1 @xl:row-start-1 sm:text-4xl">
          Rain on a tent, a train at night, a room full of typing
        </h1>

        {/* Spanning both rows and pinned to the floor of them, so its last
            line sits on the button's line rather than floating beside the
            heading's first. */}
        <p className="text-muted-foreground mt-4 max-w-[46ch] text-base text-balance @xl:col-start-2 @xl:row-span-2 @xl:row-start-1 @xl:mt-0 @xl:self-end">
          {count()} loops you can stack and level to taste. Nothing to sign up
          for, and the mix you built is still here tomorrow.
        </p>

        <div className="mt-6 @xl:col-start-1 @xl:row-start-2">
          <ShuffleButton />
        </div>
      </div>

      {/* The one saturated moment on the page, and the product sits on top of it. */}
      <div className="relative mt-10 overflow-hidden rounded-lg">
        <Image
          alt="A grass bank running up to a sky of tall cumulus, late in the day"
          className="h-[220px] w-full object-cover sm:h-[300px]"
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
            {count()} loops on {sounds.categories.length} shelves
          </p>
        </div>
      </div>
    </section>
  );
}
