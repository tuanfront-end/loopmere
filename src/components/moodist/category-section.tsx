import { SoundGrid } from "./sound-grid";

import type { Category } from "@/data/types";

interface CategorySectionProps extends Category {
  functional?: boolean;
}

export function CategorySection({
  functional = true,
  icon,
  id,
  sounds,
  title,
}: CategorySectionProps) {
  return (
    <section className="py-10" id={`category-${id}`}>
      <div className="mb-6 flex flex-col items-center gap-2">
        <div
          aria-hidden="true"
          className="bg-card grid size-10 place-items-center rounded-full border text-lg"
        >
          {icon}
        </div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
      </div>

      <SoundGrid functional={functional} id={id} sounds={sounds} />
    </section>
  );
}
