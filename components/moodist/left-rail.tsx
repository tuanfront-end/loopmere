"use client";

import {
  Coffee02Icon,
  FavouriteIcon,
  Github01Icon,
  Moon02Icon,
  ShuffleIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Logo } from "./logo";
import { SoundIcon } from "./sound-icon";
import { useTheme } from "./theme-provider";

import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { COFFEE_URL, REPO_URL, UPSTREAM_URL } from "@/constants/links";
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
        "flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm font-medium transition-colors",
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

/**
 * The row is a `<label>` and the switch is the control inside it, so the text
 * and the track are one hit target rather than a 32px sliver with a dead word
 * beside it. Drawn as a rail row — tint on hover, flat, no cast — because that
 * is what everything else in this column does.
 */
function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <label className="hover:bg-accent text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-3 rounded-sm py-2.5 pr-2 pl-2.5 text-sm font-medium transition-colors">
      <span aria-hidden="true" className="shrink-0">
        <HugeiconsIcon
          className="size-5"
          icon={isDark ? Moon02Icon : Sun03Icon}
          strokeWidth={1.5}
        />
      </span>
      Dark mode
      <Switch
        aria-label="Dark mode"
        checked={isDark}
        className="ml-auto"
        onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
      />
    </label>
  );
}

export function LeftRail() {
  const shuffle = useSoundStore((state) => state.shuffle);
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));

  // Page order, because the highlight is read off the page. Favourites is
  // last on both.
  const active = useActiveShelf([
    ...sounds.categories.map((category) => category.id),
    "favorites",
  ]);

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <a
        className="hover:bg-muted flex w-fit items-center gap-2 rounded-sm py-1.5 pr-4 pl-2.5 transition-colors"
        href="#top"
      >
        <Logo className="size-7" />
        <span className="font-heading text-lg tracking-tight">Moodist</span>
      </a>

      <nav aria-label="Shelves" className="flex min-h-0 shrink flex-col">
        {/* The negative margin and the padding cancel: without them the focus
            ring on a row is clipped by the scroller it sits in. */}
        <div className="no-scrollbar -mx-1 flex min-h-0 flex-col gap-1 overflow-y-auto px-1">
          {sounds.categories.map((category) => (
            <ShelfLink
              active={active === category.id}
              count={category.sounds.length}
              id={category.id}
              key={category.id}
              title={category.title}
            />
          ))}
        </div>

        {/* Below the rule and outside the scroller, so it is in the same place
            every time the rail is looked at. It is the one shelf the reader
            makes rather than the one they are given, and it used to appear at
            the top the moment a first heart was tapped and vanish again with
            the last — a row that moves the other eight down by forty pixels
            on a click somewhere else on the page. Empty is a state it can
            perfectly well be in, and the count says so. */}
        <div className="mx-2.5 mt-2 shrink-0 border-t pt-2">
          <div className="-mx-2.5">
            <ShelfLink
              active={active === "favorites"}
              count={favorites.length}
              icon={<HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />}
              id="favorites"
              title="Favourites"
            />
          </div>
        </div>
      </nav>

      {/* Straight after the list, not pinned under it: nine shelves leave
          half a screen of nothing between the last one and a button floated
          to the floor. Only the credit goes down there.

          The two sit at `gap-2` inside their own box rather than taking the
          rail's `gap-6`, because they are a pair — one filled, one outlined —
          and 24px apart they read as two unrelated decisions. */}
      <div className="flex flex-col gap-2">
        {/* Above the pair, not under it. A setting sits with the list it
            belongs to; the two things you press are the last word in the
            column. */}
        <div className="mb-1">
          <ThemeToggle />
        </div>

        <Button
          aria-label="Pick four sounds at random"
          className="w-full"
          size="lg"
          variant="outline"
          onClick={shuffle}
        >
          <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
          Build me a mix
        </Button>

        {/* An anchor wearing the variants, not a `Button render={<a/>}`: Base
            UI puts `role="button"` on the latter and a screen reader then
            announces a link out to a payment page as a press. Through `cn`,
            because `buttonVariants` concatenates and `w-full` has to win.

            This one carries the brand and the shuffle above it does not. The
            rail has two buttons and only one of them can be the loud one; a
            mix is four clicks away in eighty other places on this page, and
            this is the only door to the thing that keeps it running. */}
        <a
          className={cn(
            buttonVariants({ size: "lg", variant: "default" }),
            "w-full",
          )}
          href={COFFEE_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          <HugeiconsIcon icon={Coffee02Icon} strokeWidth={1.5} />
          Buy me a coffee
        </a>
      </div>

      <p className="text-muted-foreground mt-auto px-2.5 text-xs text-balance">
        Built by Boolii Studio. A Next.js port of{" "}
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
