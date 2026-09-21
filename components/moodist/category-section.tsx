import { SoundGrid } from "./sound-grid";
import { SoundIcon } from "./sound-icon";

import type { Category } from "@/data/types";

interface CategorySectionProps extends Category {
  blurb?: string;
  functional?: boolean;
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

      <div className="mt-24">
        <SoundGrid functional={functional} id={id} sounds={sounds} />
      </div>
    </section>
  );
}
