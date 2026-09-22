import Image from "next/image";

import { HeroFavourites, HeroStarters } from "./hero-panels";
import { ShuffleButton } from "./shuffle-button";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-10 sm:px-8 sm:pt-14 xl:pt-8">
      {/* Two even columns, bottom-aligned — the reference lands the heading's
          last line and the button row on very nearly the same rule, and
          `items-end` is what keeps that true whatever either column's copy
          does.

          The heading carries no measure of its own: the column is the measure,
          and the copy is cut to the two lines that fill it. A `max-w` on top
          of a column is a second opinion about the same width, and the two
          disagree the moment either changes.

          Six sizes, and every breakpoint is a measurement rather than a
          preference. This line needs a 192px column to sit in two at `4xl`,
          256 at `5xl`, 320 at `6xl` and 384 at `7xl` — measured by growing the
          box a pixel at a time until the third line goes away. The column is
          half the container less the gap, so those four numbers become four
          container widths: 520, 648, 776 and 904.

          The step at `@xl` goes *down*, from `6xl` to `4xl`, and that is the
          layout rather than a mistake: it is the width where one full-width
          column becomes two half ones, so the measure halves and the type has
          to halve with it. `7xl` lands at a 904px container, which is 1920 on
          this shell — and at 1024, where there are no rails to pay for.

          Two lines at all eight widths measured.

          The breakpoint is the *centre column's*, not the window's: with a
          rail on each side the viewport stopped being what decides this, the
          same reason the sound grid reads its container.

          Markup order is stack order — heading, then the line that explains
          it, then the buttons. */}
      <div className="@xl:grid @xl:grid-cols-2 @xl:items-end @xl:gap-x-18">
        {/* 48px against the centre column, which is the reference's own 64px
            read as a fraction of its 1316px container. Arbitrary rather than
            a step, so it carries the display leading the scale gives 5xl and
            up — a heading at this size on default leading opens gaps between
            its own lines. The weight is 500 and it carries no utility here:
            the heading row in `globals.css` sets what a display line is set
            at, which is where that decision belongs. */}
        <h1 className="text-5xl font-[450] tracking-tighter text-balance @sm:text-6xl @xl:text-4xl @min-[40.5rem]:text-5xl @min-[48.5rem]:text-6xl @min-[56.5rem]:text-7xl">
          A night train in the rain.
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
        {/* The percentage is the reference's; the floor is ours. 26% of the
            centre column is 215px and the reference's own 26% was 341px — at
            the smaller number three sound icons and a name do not both fit,
            and the names came out as "Rainy s…".

            `@3xl` rather than `@xl`, because the floor is what breaks the
            composition: two cards that are 26% and 30% of a 1316px image
            leave 44% of it showing, and the same two at their floors on a
            548px image leave four per cent. Below that width this one drops
            into the stack and the photograph gets to be a photograph. */}
        <div className="absolute top-[3.2%] left-[1.4%] hidden w-[26%] min-w-[236px] @3xl:block">
          <HeroStarters />
        </div>

        <div className="absolute right-[2.4%] bottom-[3.7%] hidden w-[30%] min-w-[248px] @xl:block">
          <HeroFavourites />
        </div>
      </div>

      <div className="mt-4 grid gap-4 @3xl:hidden">
        <HeroStarters />

        <div className="@xl:hidden">
          <HeroFavourites />
        </div>
      </div>
    </section>
  );
}
