import { SoundGrid } from "./sound-grid";
import { SoundIcon } from "./sound-icon";

import type { Category } from "@/data/types";

interface CategorySectionProps extends Category {
  blurb?: string;
  /** Shown in place of the grid when the shelf has nothing on it. */
  emptyMessage?: string;
  functional?: boolean;
  /** Favourites has no sound of its own, so it brings its own glyph. */
  icon?: React.ReactNode;
}

export function CategorySection({
  blurb,
  emptyMessage,
  functional = true,
  icon,
  id,
  sounds,
  title,
}: CategorySectionProps) {
  return (
    <section
      className="mx-auto w-full max-w-[1200px] px-6 sm:px-8"
      id={`category-${id}`}
    >
      <div className="flex items-start gap-4">
        <div aria-hidden="true" className="text-primary-ink shrink-0">
          {id === "favorites" ? icon : <SoundIcon id={id} size={32} />}
        </div>

        <div>
          {/* Favourites' title can be handed focus but is never a Tab stop:
              un-hearting the shelf's last card takes the heart with it, and
              focus comes here rather than to the top of the page.

              The ring it wears then is the global one, rounded to the
              controls' radius and given six pixels either side, which the
              negative margin hands back so the words do not move. Square
              and tight, it read as a box drawn round a word — the "F" two
              pixels off the ring. */}
          <h2
            className="-mx-1.5 rounded-sm px-1.5 text-2xl tracking-tight"
            tabIndex={id === "favorites" ? -1 : undefined}
          >
            {title}
          </h2>
          {blurb && (
            <p className="text-muted-foreground mt-1 max-w-[52ch] text-sm">
              {blurb}
            </p>
          )}
        </div>
      </div>

      {/* 40, against 16 inside the grid and 160 between sections — the ladder
          the spacing rule asks for. It was 96, which read as air on a
          1200px-wide page and as a hole once the centre column narrowed.
          24 at mobile, where the ladder below it is the same 16 and the one
          above it has come down to 96. */}
      {sounds.length === 0 && emptyMessage ? (
        /* `bg-accent` rather than a dashed outline: nothing is dropped here,
           and the shelf is empty rather than broken. */
        <div className="bg-accent mt-6 rounded-lg px-6 py-10 sm:mt-10 sm:py-12">
          {/* Balanced and measured: left to the full width of the shelf the
              sentence breaks with two words on the last line, which reads as a
              mistake rather than as a sentence. Body size, because it is a
              sentence read through rather than a record read in passing. */}
          <p className="text-muted-foreground mx-auto max-w-[42ch] text-center text-base text-balance">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="mt-6 sm:mt-10">
          <SoundGrid functional={functional} id={id} sounds={sounds} />
        </div>
      )}
    </section>
  );
}
