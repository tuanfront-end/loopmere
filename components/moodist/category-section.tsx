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
          <h2 className="text-2xl tracking-tight">{title}</h2>
          {blurb && (
            <p className="text-muted-foreground mt-1 max-w-[52ch] text-sm">
              {blurb}
            </p>
          )}
        </div>
      </div>

      {/* 40, against 16 inside the grid and 128 between sections — the ladder
          the spacing rule asks for. It was 96, which read as air on a
          1200px-wide page and as a hole once the centre column narrowed. */}
      {sounds.length === 0 && emptyMessage ? (
        /* `bg-accent` rather than a dashed outline: nothing is dropped here,
           and the shelf is empty rather than broken. */
        <div className="bg-accent mt-10 rounded-lg px-6 py-12">
          {/* Balanced and measured: left to the full width of the shelf the
              sentence breaks with two words on the last line, which reads as a
              mistake rather than as a sentence. */}
          <p className="text-muted-foreground mx-auto max-w-[42ch] text-center text-sm text-balance">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <SoundGrid functional={functional} id={id} sounds={sounds} />
        </div>
      )}
    </section>
  );
}
