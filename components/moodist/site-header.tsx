"use client";

import {
  ChevronDownIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  FavouriteIcon,
  Github01Icon,
  Menu01Icon,
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
  DropdownMenuSeparator,
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
    <span
      aria-hidden="true"
      className="bg-muted grid size-7 shrink-0 place-items-center rounded-full"
    >
      <SoundIcon id={id} size={16} />
    </span>
  );
}

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
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "mx-auto flex items-center gap-1 transition-all duration-300 ease-out",
          scrolled
            ? "bg-card/60 shadow-soft-lg mt-3 h-12 max-w-[calc(100%-1.5rem)] rounded-full px-2 ring-1 ring-white/50 ring-inset backdrop-blur-xl backdrop-saturate-125 sm:h-14 sm:max-w-[960px] sm:px-3"
            : "h-14 max-w-[1200px] px-6 sm:h-16 sm:px-8",
        )}
      >
        <a
          className="hover:bg-muted -ml-2 flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-3 pl-2 transition-colors"
          href="#top"
        >
          <Logo className="size-6" />
          <span className="font-heading text-base font-medium tracking-tight">
            Moodist
          </span>
        </a>

        <nav
          aria-label="Main"
          className="ml-2 hidden items-center gap-1 lg:flex"
        >
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
              aria-label="Pick four sounds at random"
              className="shrink-0"
              size="sm"
              variant="outline"
              onClick={shuffle}
            >
              <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              <span className="hidden sm:inline">Surprise me</span>
            </Button>
          ) : (
            <>
              <span className="bg-chip text-primary-ink hidden h-9 shrink-0 items-center rounded-full px-3 text-xs font-medium tabular-nums sm:inline-flex">
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
            className={buttonVariants({
              className: "hidden lg:inline-flex",
              size: "icon-sm",
              variant: "ghost",
            })}
            href={REPO_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={1.5} />
          </a>

          {/* The mobile nav is a menu rather than a Drawer: ten anchors on one
              route, and the rail below already scrolls the same eight. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Menu"
                  className="lg:hidden"
                  size="icon-sm"
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} />
                </Button>
              }
            />

            <DropdownMenuContent
              align="end"
              className="no-scrollbar max-h-[70dvh] min-w-64 overflow-y-auto"
              sideOffset={10}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Jump to a shelf</DropdownMenuLabel>
                {shelfItems}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {favorites.length > 0 && (
                  <DropdownMenuItem
                    className="gap-2 px-1.5 py-1.5"
                    render={<a href="#category-favorites" />}
                  >
                    <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />
                    Favourites
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {favorites.length}
                    </span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="gap-2 px-1.5 py-1.5"
                  onClick={shuffle}
                >
                  <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
                  Surprise me
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="gap-2 px-1.5 py-1.5"
                  render={
                    <a
                      href={REPO_URL}
                      rel="noreferrer noopener"
                      target="_blank"
                    />
                  }
                >
                  <HugeiconsIcon icon={Github01Icon} strokeWidth={1.5} />
                  Source on GitHub
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
