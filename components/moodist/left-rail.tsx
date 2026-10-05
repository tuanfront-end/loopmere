"use client";

import {
  Coffee02Icon,
  FavouriteIcon,
  Github01Icon,
  Route01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { Logo } from "./logo";
import { SoundIcon } from "./sound-icon";
import { SearchField, SearchResults } from "./sound-search";
import { ThemeToggle } from "./theme-toggle";

import { buttonVariants } from "@/components/ui/button";
import { COFFEE_URL, REPO_URL, UPSTREAM_URL } from "@/constants/links";
import { sounds } from "@/data/sounds";
import { useActiveShelf } from "@/hooks/use-active-shelf";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

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
        "flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm font-medium transition-colors short:py-2",
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
      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
        {count}
      </span>
    </a>
  );
}

export function LeftRail() {
  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));

  // Page order, because the highlight is read off the page. Favourites is
  // the last shelf on both, and the roadmap under it is not a shelf.
  const active = useActiveShelf(
    [...sounds.categories.map((category) => category.id), "favorites"],
    "roadmap",
  );

  const [query, setQuery] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const searching = query.trim().length > 0;

  // `/` is the web's key for a page's search. Read by the character, not the
  // key's place, so it is the key that types a slash on any layout. Only while
  // the rail is drawn: under `xl` the field lives in a closed sheet.
  const shortcuts = useSettingsStore((state) => state.shortcuts);
  useHotkeys(
    "/",
    (event) => {
      if (!field.current?.offsetParent) return;

      event.preventDefault();
      field.current.focus();
    },
    { enabled: shortcuts, useKey: true },
  );

  return (
    <div
      className="flex h-full flex-col gap-6 p-5 short:gap-4 short:p-4"
      data-search
    >
      {/* The search sits over the shelves and, while it holds a query, takes
          their place: the results get the rail's height to run in, and
          nothing floats over the column the cards are in.

          Under 700px of window the field moves up beside the mark and the
          name goes to a screen reader only. Stacked, it cost the 44px that
          had every shelf showing at 1366×657 without a scroll. */}
      <div className="flex flex-col gap-4 short:gap-3 shorter:flex-row shorter:items-center shorter:gap-2">
        <a
          className="hover:bg-muted flex w-fit shrink-0 items-center gap-2 rounded-sm py-1.5 pr-4 pl-2.5 transition-colors shorter:px-1.5"
          href="#top"
        >
          <Logo className="size-7" />
          <span className="font-heading text-lg tracking-tight shorter:sr-only">
            Loopmere
          </span>
        </a>

        <SearchField
          className="shorter:min-w-0 shorter:flex-1"
          inputRef={field}
          shortcut={shortcuts}
          value={query}
          onChange={setQuery}
        />
      </div>

      {searching ? (
        <SearchResults inputRef={field} query={query} />
      ) : (
        <nav
          aria-label="Jump to a shelf"
          className="flex min-h-0 shrink flex-col"
        >
          {/* The negative margin and the padding cancel: without them the focus
            ring on a row is clipped by the scroller it sits in. */}
          <div className="no-scrollbar -mx-1 flex min-h-0 flex-col gap-1 overflow-y-auto px-1 shorter:gap-0.5">
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
          <div className="mx-2.5 mt-2 shrink-0 border-t pt-2 shorter:mt-1 shorter:pt-1">
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
      )}

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
          <ThemeToggle className="short:py-2" />
        </div>

        {/* An anchor wearing the variants, not a `Button render={<a/>}`: Base
            UI puts `role="button"` on the latter and a screen reader then
            announces a link out to a payment page as a press. Through `cn`,
            because `buttonVariants` concatenates and `w-full` has to win.

            The loud one of the pair, and the first. The rail has two buttons
            and only one of them can carry the brand: the roadmap under it is
            a jump down this page, and this is the only door to the thing that
            keeps the page running. */}
        <a
          className={cn(
            buttonVariants({ size: "lg", variant: "default" }),
            "w-full short:h-10",
          )}
          href={COFFEE_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          <HugeiconsIcon icon={Coffee02Icon} strokeWidth={1.5} />
          Buy me a coffee
        </a>

        {/* It took the place of "Build me a mix", which the hero and the mix
            panel both still carry. An anchor rather than a scroll call, so it
            lands on the scroll padding and works with no JavaScript, the way
            every row above it does. */}
        <a
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "w-full short:h-10",
          )}
          href="#roadmap"
        >
          <HugeiconsIcon icon={Route01Icon} strokeWidth={1.5} />
          Roadmap
        </a>
      </div>

      <p className="text-muted-foreground mt-auto px-2.5 text-xs text-balance shorter:hidden">
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
