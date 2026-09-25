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
   be compared across the three sizes below. The ladder's tightest column is
   5.5em — 396px at 72px, the two-column hero at its narrowest — and these
   four need at most 5.38. Seventeen candidates were measured; eleven of
   them, "A cafe that never closes." among them at 5.62, need more than the
   ladder hands out and are not here.

   The other end is measured too: the shortest of the four folds onto one
   line at 9.76em, and the widest measure the heading is ever handed is 8em,
   the cap it carries. */
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

          Only once each half holds what it holds at full size, though, and
          that is a 928px centre column. The heading needs 386px to sit in two
          lines at `7xl` and the button row is 354; a column is half the
          container less the gutters and the 72px gap, so 928 leaves each ten
          pixels spare. Below it the hero is one column.

          It used to split at `@xl`, 576px, and that is where the laptops
          live: 1280 to 1536 hand the centre column 612 to 828px, and a
          tablet has no rails to pay for but is still under 900. Split there,
          each half was 238 to 380px wide — the heading stepped down to 36px
          and 48 to fit it, the button row broke into two buttons of unequal
          width, and the copy column stood twice as tall as the line it was
          explaining. A shrunk heading beside a stack that had come apart read
          as a layout failing, not as one choosing.

          The breakpoint is the *centre column's*, not the window's: with a
          rail on each side the viewport stopped being what decides this, the
          same reason the sound grid reads its container.

          Markup order is stack order — heading, then the line that explains
          it, then the buttons. */}
      <div className="@min-[58rem]:grid @min-[58rem]:grid-cols-2 @min-[58rem]:items-end @min-[58rem]:gap-x-18">
        {/* Three sizes, and the ladder only climbs: 48, 60 from a 384px
            column, 72 from 576 — stacked or split, a wider column never
            hands the heading a smaller size. Each carries display leading
            from the display rows in `globals.css`.

            Every one of the four lines sits in two anywhere between 5.38em
            and 9.76em of measure: the first is where the longest breaks into
            a third, the second where the shortest folds into one. Split, the
            column is the measure and never hands out more than 7.4em.
            Stacked, the row is wider than that, so the heading carries a cap
            of its own — `8em`, a guard rather than a width to design to:
            `text-balance` breaks a line at the same word anywhere in the
            band, so the cap moves nothing on screen, and it never binds in
            two columns.

            The weight is 460, the one weight set at the call site on a
            heading, and on purpose: set by eye a shade under the heading
            row's 500, because large type reads heavier than small at one
            weight. */}
        <h1 className="min-h-[2lh] max-w-[8em] text-5xl font-[460] tracking-tighter text-balance @sm:text-6xl @xl:text-7xl">
          <Typewriter lines={LINES} />
        </h1>

        <div className="mt-6 @min-[58rem]:mt-0">
          <p className="text-muted-foreground max-w-[46ch] text-base text-balance">
            {count()} loops you can stack and level to taste. Nothing to sign up
            for, and the mix you built is still here tomorrow.
          </p>

          {/* Side by side while the pair fits, and two full-width buttons
              once it does not, which is a phone under about 400px. The row
              is held to the pair's own width, so on one line there is no
              space for `grow` to hand out and each button keeps its label's
              width; wrapped, each line holds one button and it takes the
              whole line. What it used to wrap into was 168px over 174, both
              flush left — two widths that differ by six pixels read as an
              accident rather than a stack. */}
          <div className="mt-6 flex max-w-fit flex-wrap items-center gap-3">
            <ShuffleButton className="grow" />

            {/* An anchor wearing the variants: a jump down the page announced
                as a press is the wrong verb. */}
            <a
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "grow",
              )}
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
          // Fetched first, and in the markup rather than preloaded: `priority`
          // is deprecated in Next 16, and its guidance for a hero is eager
          // loading at high priority. Before this it went out at Low.
          fetchPriority="high"
          fill
          loading="eager"
          // The frame's real width in each shell — the centre column less its
          // gutters and both rails, capped by the section's 1136px. It was
          // "800px from 1280", which fetched 1920 wide for a 548px frame at
          // 1280 and 828 wide, blurred, for a 1136px frame at 1920.
          sizes="(min-width: 1536px) min(1136px, calc(100vw - 772px)), (min-width: 1280px) calc(100vw - 732px), min(1136px, calc(100vw - 48px))"
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
