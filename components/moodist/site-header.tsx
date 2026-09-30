"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
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

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REPO_URL } from "@/constants/links";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

/**
 * The shelves, as the menu lists them. Anchors rather than `scrollIntoView`:
 * `scroll-padding-top` in `globals.css` already clears the sticky bar, so a
 * plain `href` lands in the right place and still works with no JavaScript.
 */
const shelves = sounds.categories.map((category) => ({
  count: category.sounds.length,
  href: `#category-${category.id}`,
  id: category.id,
  title: category.title,
}));

function ShelfIcon({ id }: { id: string }) {
  return (
    <span aria-hidden="true" className="shrink-0">
      <SoundIcon id={id} size={24} />
    </span>
  );
}

/**
 * The top bar, for the one band of widths that has it: `lg` to `xl`. Above
 * that the rails carry all of this; under it a phone has its tab bar at the
 * bottom edge instead, where the thumb is — `MobileDock`. The sheet of
 * shelves this bar used to open under `lg` went down there with it.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const noSelected = useSoundStore((state) => state.noSelected());
  const shuffle = useSoundStore((state) => state.shuffle);
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));

  const selected = useSoundStore(
    useShallow(
      (state) =>
        Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected)
          .length,
    ),
  );

  /** The morph is the first motion a visitor sees, so it answers the first scroll. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shelfItems = shelves.map((shelf) => (
    <DropdownMenuItem
      className="gap-2 px-1.5 py-1.5"
      key={shelf.id}
      render={<a href={shelf.href} />}
    >
      <ShelfIcon id={shelf.id} />
      {shelf.title}
      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
        {shelf.count}
      </span>
    </DropdownMenuItem>
  ));

  return (
    <header className="sticky top-0 z-50 hidden lg:block xl:hidden">
      <div
        className={cn(
          "mx-auto flex items-center gap-1 transition-[height,max-width,margin,padding,border-radius,background-color,box-shadow] duration-300 ease-out",
          scrolled
            ? "bg-card/60 shadow-soft-lg mt-3 h-14 max-w-[960px] rounded-full px-3 ring-1 ring-white/50 ring-inset dark:ring-white/10 backdrop-blur-xl backdrop-saturate-125"
            : "h-16 max-w-[1200px] px-8",
        )}
      >
        <a
          className="hover:bg-muted -ml-2 flex shrink-0 items-center gap-2 rounded-sm py-1.5 pr-3 pl-2 transition-colors"
          href="#top"
        >
          <Logo className="size-6" />
          <span className="font-heading text-base font-medium tracking-tight">
            Loopmere
          </span>
        </a>

        <nav aria-label="Main" className="ml-2 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="ghost">
                  Shelves
                  <ChevronDownIcon className="transition-transform group-aria-expanded/button:rotate-180" />
                </Button>
              }
            />

            <DropdownMenuContent
              align="start"
              className="min-w-64"
              sideOffset={10}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Jump to a shelf</DropdownMenuLabel>
                {shelfItems}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {favorites.length > 0 && (
            <a
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href="#category-favorites"
            >
              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />
              Favourites
              <span className="text-muted-foreground text-xs tabular-nums">
                {favorites.length}
              </span>
            </a>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {noSelected ? (
            <Button
              className="shrink-0"
              size="sm"
              variant="outline"
              onClick={shuffle}
            >
              <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              Surprise me
            </Button>
          ) : (
            <>
              <span className="bg-chip text-primary-ink inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-medium tabular-nums">
                {selected} in the mix
              </span>

              <Button
                aria-label={
                  isPlaying
                    ? `Pause, ${selected} sounds in the mix`
                    : `Play, ${selected} sounds in the mix`
                }
                className="shrink-0"
                size="sm"
                onClick={togglePlay}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </>
          )}

          {/* An anchor styled as a button, not a Button rendering an anchor:
              Base UI puts role="button" on the latter, so a screen reader
              announces a navigation as a press. */}
          <a
            aria-label="Source on GitHub"
            className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
            href={REPO_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
}
