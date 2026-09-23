import Image from "next/image";

import { HeroFavourites, HeroStarters } from "./hero-panels";
import { ShuffleButton } from "./shuffle-button";
import { Typewriter } from "./typewriter";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";

/* Four scenes the shelves can actually build. They open identically on
   purpose: the caret deletes back only to the "A " they share, which reads as
   one sentence being rewritten rather than four unrelated ones being wiped.

   The first is server-rendered whole — it is what a crawler and the first
   paint both see — so it is the one that has to stand on its own.

   Each was picked by measurement, not by ear. A sentence that cycles through a
   fixed box has to break into two lines at *every* width the box takes, or the
   heading changes height four times a minute; so the number that matters is
   the narrowest column it still fits two lines in, expressed in em so it can
   be compared across the six sizes below. The ladder's tightest column is
   5.67em — 272px at 48px, which is a 320px phone — and these four measure
   5.33, 5.02, 5.31 and 5.35. Seventeen candidates were measured; eleven of
   them, "A cafe that never closes." among them, were over it and are not here.

   The other end is measured too: past about 8.2em a sentence collapses onto
   one line, and the widest column this ladder hands out is 8.2em. The
   narrowest ceiling of the four is 9.77em. */
const LINES = [
  "A night train in the rain.",
  "A fire and a long book.",
  "A quiet hour before six.",
  "A tent and a lot of wind.",
];

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
        {/* Every size is a step on the scale — the ladder and its
            measurements are in the comment above — and every step carries
            display leading, `text-4xl` included, from the display rows in
            `globals.css`.

            The weight is 460, the one weight set at the call site on a
            heading, and on purpose: set by eye a shade under the heading
            row's 500, because large type reads heavier than small at one
            weight. */}
        <h1 className="min-h-[2lh] text-5xl font-[460] tracking-tighter text-balance @sm:text-6xl @xl:text-4xl @min-[40.5rem]:text-5xl @min-[48.5rem]:text-6xl @min-[56.5rem]:text-7xl">
          <Typewriter lines={LINES} />
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
          picture in it and still be read.

          From `@xl`, where the first panel moves onto it, the frame is the
          outer ring of three concentric corners — frame `xl`, panel `md`,
          row and button `sm` — and each is the one inside it plus the space
          between them. So the panels sit a fixed `--panel-inset` in from the
          edge, the two radii subtracted, and not a percentage of the frame.
          They were a percentage, taken from the reference, and a percentage
          grows with the column while a radius does not, so the corners ran
          between 6 and 20px off concentric, further the wider the column.
          14.4 is about what those percentages averaged between 1440 and
          1600.

          Read against the shortest side, 33.6 is 12% of the frame where
          `@xl` first applies and less at every width above it. Both
          neighbours were built: `2xl` over `lg`, 19.2 apart, read too round
          for a photograph this size, and `xl` over `lg`, 9.6 apart, left the
          panels stuck in the corners with their shadow clipped by the frame. */}
      <div className="relative mt-10 aspect-[16/11] overflow-hidden rounded-lg [--panel-inset:calc(var(--radius-xl)_-_var(--radius-md))] @xl:mt-12 @xl:aspect-[1.94] @xl:rounded-xl">
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
        <div className="absolute top-(--panel-inset) left-(--panel-inset) hidden w-[26%] min-w-[236px] @3xl:block">
          <HeroStarters />
        </div>

        <div className="absolute right-(--panel-inset) bottom-(--panel-inset) hidden w-[30%] min-w-[248px] @xl:block">
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
