"use client";

import { sounds } from "@/data/sounds";
import { SoundIcon } from "./sound-icon";

/**
 * A rail is padded by the reach of whatever paints outside a chip, and the
 * padding is pulled back off the layout — otherwise the focus ring promotes
 * the vertical axis to `auto` and the whole strip judders.
 */
export function CategoryRail() {
  const goto = (id: string) =>
    document
      .getElementById(`category-${id}`)
      ?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-2xl tracking-tight">Eight shelves</h2>
        <p className="text-muted-foreground text-sm">
          Jump straight to one.
        </p>
      </div>

      <nav
        aria-label="Sound categories"
        className="no-scrollbar -my-3 mt-6 flex gap-3 self-stretch overflow-x-auto py-3"
      >
        {sounds.categories.map((category) => (
          <button
            className="bg-card hover:bg-accent hover:shadow-soft flex shrink-0 items-center gap-2 rounded-full border p-2 pr-4 text-sm font-medium transition-all hover:border-transparent"
            key={category.id}
            onClick={() => goto(category.id)}
          >
            <span
              aria-hidden="true"
              className="bg-muted grid size-8 place-items-center rounded-full"
            >
              <SoundIcon id={category.id} size={18} />
            </span>
            {category.title}
          </button>
        ))}
      </nav>
    </section>
  );
}
