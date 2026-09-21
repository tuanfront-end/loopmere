"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { SoundIcon } from "./sound-icon";

import { sounds } from "@/data/sounds";

/**
 * Hover tints the ground and brings the hairline up to a faint brand — the
 * same pair the sound cards take, minus the cast: a chip here jumps the page
 * rather than joining the mix, and lifting it off the surface would say it
 * was the second of those.
 */
const CHIP =
  "bg-card hover:bg-accent hover:border-primary/60 flex shrink-0 items-center gap-2 rounded-sm border p-3 pr-4 text-sm font-medium transition-colors";

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
          Nine, counting the one you build.
        </p>
      </div>

      <nav
        aria-label="Sound categories"
        className="no-scrollbar -my-3 mt-6 flex gap-3 self-stretch overflow-x-auto py-3"
      >
        {sounds.categories.map((category) => (
          <button
            className={CHIP}
            key={category.id}
            onClick={() => goto(category.id)}
          >
            <span aria-hidden="true" className="shrink-0">
              <SoundIcon id={category.id} size={24} />
            </span>
            {category.title}
          </button>
        ))}

        {/* The rule stands in for the one the left rail draws above its own
            Favourites row: eight shelves that came with the app, then the one
            the reader fills. */}
        <div aria-hidden="true" className="bg-border my-1 w-px shrink-0" />

        <button className={CHIP} onClick={() => goto("favorites")}>
          <span aria-hidden="true" className="shrink-0">
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />
          </span>
          Favourites
        </button>
      </nav>
    </section>
  );
}
