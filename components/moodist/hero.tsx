import Image from "next/image";

import { HeroLevels, HeroMix } from "./hero-panels";
import { ShuffleButton } from "./shuffle-button";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-10 sm:px-8 sm:pt-14 xl:pt-8">
      {/* Two columns, and the split is measured rather than guessed: in the
          reference the right column opens at 48% of the container and the gap
          between them is 9% of it. Solved for this container that is
          `[0.756fr_1fr]` at `gap-x-18` — not the half-and-half it looks like,
          because the heading is the shorter column and the louder one.

          The breakpoint is the *centre column's*, not the window's: with a
          rail on each side the viewport stopped being what decides this, the
          same reason the sound grid reads its container.

          Markup order is stack order — heading, then the line that explains
          it, then the buttons. */}
      <div className="@xl:grid @xl:grid-cols-[0.756fr_1fr] @xl:items-start @xl:gap-x-18">
        <h1 className="max-w-[18ch] text-3xl tracking-tighter text-balance sm:text-4xl">
          Rain on a tent, a train at night, a room full of typing
        </h1>

        <div className="mt-6 @xl:mt-0">
          <p className="text-muted-foreground max-w-[46ch] text-base text-balance">
            {count()} loops you can stack and level to taste. Nothing to sign up
            for, and the mix you built is still here tomorrow.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ShuffleButton />

            {/* An anchor wearing the variants: a jump down the page announced
                as a press is the wrong verb. */}
            <a
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              href="#category-nature"
            >
              Browse the shelves
            </a>
          </div>
        </div>
      </div>

      {/* The one saturated moment on the page, and the product sits on top of
          it. 1.94:1 from `@xl` up, which is the reference's own ratio; below
          that the frame goes squarer and the two panels drop out of it into a
          stack, because a 342px-wide phone cannot carry a 26% card with a
          picture in it and still be read. */}
      <div className="relative mt-10 aspect-[16/11] overflow-hidden rounded-lg @xl:mt-12 @xl:aspect-[1.94]">
        <Image
          alt="A grass bank running up to a sky of tall cumulus, late in the day"
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1280px) 800px, 100vw"
          src="/images/hero-background.webp"
        />

        {/* Rendered twice rather than moved, because overlaying needs them
            inside a box with `overflow-hidden` and stacking needs them
            outside it. `hidden` takes the copy out of the accessibility tree
            as well as off the screen, so nothing is announced twice. */}
        <div className="absolute top-[3.2%] left-[1.4%] hidden w-[26%] @xl:block">
          <HeroMix />
        </div>

        <div className="absolute right-[2.4%] bottom-[3.7%] hidden w-[30%] min-w-[248px] @xl:block">
          <HeroLevels />
        </div>
      </div>

      <div className="mt-4 grid gap-4 @xl:hidden">
        <HeroMix />
        <HeroLevels />
      </div>
    </section>
  );
}
