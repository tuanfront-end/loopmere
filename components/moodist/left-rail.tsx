"use client";

import {
  FavouriteIcon,
  Github01Icon,
  ShuffleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Logo } from "./logo";
import { SoundIcon } from "./sound-icon";

import { Button } from "@/components/ui/button";
import { REPO_URL, UPSTREAM_URL } from "@/constants/links";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

/**
 * Which shelf the reader is actually looking at, so the rail answers the
 * scroll rather than only the click. No JavaScript means no highlight, which
 * is the rail as it was before — never a rail with nothing in it.
 *
 * The last shelf whose top has crossed a line a third down the screen, read
 * on each frame the page moves. An `IntersectionObserver` over a narrow band
 * was the first attempt and it lit the wrong row: past the final shelf no
 * section is inside the band at all, so the callback stops firing and the
 * highlight stays wherever it was when the reader left the band. Measuring
 * answers every scroll position, including the ones with nothing in view.
 */
function useActiveShelf(ids: Array<string>) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join();

  useEffect(() => {
    const shelves = key.split(",");

    /**
     * Nine reads with no write between them, so one layout answers all nine
     * and the browser has already coalesced the scroll events down to the
     * frame rate. A `requestAnimationFrame` gate on top of that buys a flag to
     * get wrong rather than any measurable work.
     */
    const measure = () => {
      const line = window.innerHeight / 3;
      let current: string | null = null;

      for (const id of shelves) {
        const section = document.getElementById(`category-${id}`);

        if (section && section.getBoundingClientRect().top <= line) {
          current = id;
        }
      }

      setActive(current);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [key]);

  return active;
}

interface ShelfLinkProps {
  active: boolean;
  count: number;
  icon?: React.ReactNode;
  id: string;
  title: string;
}

function ShelfLink({ active, count, icon, id, title }: ShelfLinkProps) {
  return (
    <a
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm font-medium transition-all",
        // A rail row is a tab, not a card, and the two idioms are kept apart
        // on purpose: a tab tints and stays flat, a card lifts. What both
        // still avoid is `bg-muted`, which is what the icon's own disc is
        // drawn in — the disc used to vanish under the pointer.
        "hover:bg-accent",
        active ? "bg-muted" : "text-muted-foreground hover:text-foreground",
      )}
      href={`#category-${id}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-colors",
          active && "text-primary-ink",
        )}
      >
        {icon ?? <SoundIcon id={id} size={24} />}
      </span>
      {title}
      <span className="ml-auto text-xs tabular-nums opacity-60">{count}</span>
    </a>
  );
}

export function LeftRail() {
  const shuffle = useSoundStore((state) => state.shuffle);
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));

  const active = useActiveShelf([
    "favorites",
    ...sounds.categories.map((category) => category.id),
  ]);

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <a
        className="hover:bg-muted -ml-2 flex w-fit items-center gap-2 rounded-full py-1.5 pr-4 pl-2 transition-colors"
        href="#top"
      >
        <Logo className="size-7" />
        <span className="font-heading text-lg tracking-tight">Moodist</span>
      </a>

      <nav
        aria-label="Shelves"
        className="no-scrollbar -mx-1 flex min-h-0 shrink flex-col gap-1 overflow-y-auto px-1"
      >
        {favorites.length > 0 && (
          <ShelfLink
            active={active === "favorites"}
            count={favorites.length}
            icon={<HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />}
            id="favorites"
            title="Favourites"
          />
        )}

        {sounds.categories.map((category) => (
          <ShelfLink
            active={active === category.id}
            count={category.sounds.length}
            id={category.id}
            key={category.id}
            title={category.title}
          />
        ))}
      </nav>

      {/* Straight after the list, not pinned under it: nine shelves leave
          half a screen of nothing between the last one and a button floated
          to the floor. Only the credit goes down there. */}
      <Button
        aria-label="Pick four sounds at random"
        className="w-full"
        size="lg"
        onClick={shuffle}
      >
        <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
        Build me a mix
      </Button>

      <p className="text-muted-foreground mt-auto text-xs">
        A Next.js port of{" "}
        <a
          className="hover:text-foreground underline underline-offset-4 transition-colors"
          href={UPSTREAM_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          Maze&rsquo;s Moodist
        </a>
        , MIT.{" "}
        <a
          className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
          href={REPO_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          <HugeiconsIcon
            aria-hidden="true"
            className="size-3.5"
            icon={Github01Icon}
            strokeWidth={1.5}
          />
          Source
        </a>
      </p>
    </div>
  );
}
