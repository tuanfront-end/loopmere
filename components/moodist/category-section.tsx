import { SoundGrid } from "./sound-grid";
import { SoundIcon } from "./sound-icon";

import type { Category } from "@/data/types";

interface CategorySectionProps extends Category {
  blurb?: string;
  functional?: boolean;
  /** Favourites has no sound of its own, so it brings its own glyph. */
  icon?: React.ReactNode;
}

export function CategorySection({
  blurb,
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
        <div
          aria-hidden="true"
          className="bg-chip text-primary-ink grid size-11 shrink-0 place-items-center rounded-full"
        >
          {id === "favorites" ? icon : <SoundIcon id={id} />}
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
      <div className="mt-10">
        <SoundGrid functional={functional} id={id} sounds={sounds} />
      </div>
    </section>
  );
}
