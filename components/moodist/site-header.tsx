"use client";

import {
  ChevronDownIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  Coffee02Icon,
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  drawerRow,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COFFEE_URL, REPO_URL } from "@/constants/links";
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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

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
    <header className="sticky top-0 z-50 xl:hidden">
      <div
        className={cn(
          "mx-auto flex items-center gap-1 transition-all duration-300 ease-out",
          scrolled
            ? "bg-card/60 shadow-soft-lg mt-3 h-12 max-w-[calc(100%-1.5rem)] rounded-full px-2 ring-1 ring-white/50 ring-inset dark:ring-white/10 backdrop-blur-xl backdrop-saturate-125 sm:h-14 sm:max-w-[960px] sm:px-3"
            : "h-14 max-w-[1200px] px-6 sm:h-16 sm:px-8",
        )}
      >
        <a
          className="hover:bg-muted -ml-2 flex shrink-0 items-center gap-2 rounded-sm py-1.5 pr-3 pl-2 transition-colors"
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
            // Through `cn`, not bare: `buttonVariants` does not merge, so the
            // base `inline-flex` and this `hidden` both survive and the wider
            // rule wins — the link showed at every width.
            className={cn(
              buttonVariants({ size: "icon-sm", variant: "ghost" }),
              "hidden lg:inline-flex",
            )}
            href={REPO_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={1.5} />
          </a>

          {/* A sheet rather than a menu. Ten rows anchored to a 36px button in
              the top-right corner is a panel reaching across the screen away
              from the thumb holding the phone, scrolling inside itself at
              `max-h-[70dvh]`; the same ten at the bottom edge are where the
              hand already is, and the sheet can be thrown shut without aiming.
              The desktop `Shelves` menu above stays a menu: it is pointed at. */}
          <Drawer open={navOpen} onOpenChange={setNavOpen}>
            <DrawerTrigger
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

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Jump to a shelf</DrawerTitle>
                <DrawerDescription>
                  Eight that came with the app and the one you fill yourself.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col gap-1">
                {shelves.map((shelf) => (
                  <DrawerClose
                    className={drawerRow}
                    key={shelf.id}
                    render={<a href={shelf.href} />}
                  >
                    <ShelfIcon id={shelf.id} />
                    {shelf.title}
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {shelf.count}
                    </span>
                  </DrawerClose>
                ))}
              </div>

              {/* Under a rule and always there, the way the left rail carries
                  it from `xl` up. */}
              <div className="mx-2.5 mt-2 border-t pt-2">
                <div className="-mx-2.5">
                  <DrawerClose
                    className={drawerRow}
                    render={<a href="#category-favorites" />}
                  >
                    <span aria-hidden="true" className="shrink-0">
                      <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />
                    </span>
                    Favourites
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {favorites.length}
                    </span>
                  </DrawerClose>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-1">
                <DrawerClose className={drawerRow} onClick={shuffle}>
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={ShuffleIcon}
                    strokeWidth={1.5}
                  />
                  Surprise me
                </DrawerClose>

                <DrawerClose
                  className={drawerRow}
                  render={
                    <a
                      href={REPO_URL}
                      rel="noreferrer noopener"
                      target="_blank"
                    />
                  }
                >
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={Github01Icon}
                    strokeWidth={1.5}
                  />
                  Source on GitHub
                </DrawerClose>

                {/* A row, not the outline button the rail gives it. Inside a
                    sheet every other way out is a row, and one button among
                    them would read as the thing the sheet was opened for. */}
                <DrawerClose
                  className={drawerRow}
                  render={
                    <a
                      href={COFFEE_URL}
                      rel="noreferrer noopener"
                      target="_blank"
                    />
                  }
                >
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={Coffee02Icon}
                    strokeWidth={1.5}
                  />
                  Buy me a coffee
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
