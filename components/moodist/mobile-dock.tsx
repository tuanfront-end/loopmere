"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import {
  Coffee02Icon,
  DashboardSquare02Icon,
  FavouriteIcon,
  Github01Icon,
  LibraryIcon,
  Menu01Icon,
  Route01Icon,
  ShuffleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { playFavourites } from "./hero-panels";
import { Logo } from "./logo";
import { LevelSliders, MixDesk } from "./right-rail";
import { SoundIcon } from "./sound-icon";
import { ThemeToggle } from "./theme-toggle";
import { ToolsSheetBody } from "./toolbar";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  drawerRow,
} from "@/components/ui/drawer";
import { COFFEE_URL, REPO_URL } from "@/constants/links";
import { sounds } from "@/data/sounds";
import { useActiveShelf } from "@/hooks/use-active-shelf";
import { scrollBehavior } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

type Sheet = "mix" | "more" | "shelves" | "tools";

/** id → label, built once. The player names sounds it draws no card for. */
const LABELS: Record<string, string> = Object.fromEntries(
  sounds.categories.flatMap((category) =>
    category.sounds.map((sound) => [sound.id, sound.label]),
  ),
);

/** Page order, because the highlight is read off the page — the rail's list. */
const SHELF_IDS = [
  ...sounds.categories.map((category) => category.id),
  "favorites",
];

/**
 * The bar leaves on the way down and comes back on the way up — the reader
 * reaching for it is the reader scrolling back. Never tucked near either end
 * of the page, where there is nothing left to make room for.
 *
 * `hold` is for scrolls the bar itself started. A tab that jumps down the page
 * and then watches its own bar slide away under the thumb that pressed it
 * reads as the tap having gone wrong.
 */
function useTucked() {
  const [tucked, setTucked] = useState(false);
  const holdUntil = useRef(0);

  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const end = document.documentElement.scrollHeight - window.innerHeight;

      if (y < 80 || y > end - 80 || Date.now() < holdUntil.current) {
        setTucked(false);
        last = y;
        return;
      }

      // Eight pixels either way before it counts, so a thumb resting on the
      // glass and drifting does not flick the bar in and out.
      if (Math.abs(y - last) < 8) return;

      setTucked(y > last);
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hold = useCallback(() => {
    holdUntil.current = Date.now() + 1200;
    setTucked(false);
  }, []);

  return { hold, tucked, untuck: () => setTucked(false) };
}

/**
 * True once the hero has scrolled off the top of the screen — not before it,
 * which is where a page opened at an anchor starts.
 */
function usePastHero() {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");

    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) =>
      setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return past;
}

/**
 * The hero's first button, kept in reach for a visitor who scrolled past it
 * with nothing picked — the moment a page of eighty-four loops is hardest to
 * start. It leaves the moment the mix has something in it, and the player at
 * the bottom edge rises in its place: one offer at the top while there is
 * nothing to play, one transport at the bottom once there is.
 *
 * The player's shape turned over: the same glass, the same 24px corner around
 * a button 8px in, and the name on the left because a pinned bar is the only
 * place the name is on the screen by then.
 */
function StartBar({
  favorites,
  shown,
}: {
  favorites: Array<string>;
  shown: boolean;
}) {
  const shuffle = useSoundStore((state) => state.shuffle);
  const saved = favorites.length > 0;

  // Anchors land clear of the bar while it is down — `globals.css`.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-start-bar", shown);

    return () => document.documentElement.removeAttribute("data-start-bar");
  }, [shown]);

  return (
    <div
      className={cn(
        "bg-card/85 shadow-soft-lg fixed inset-x-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-40 flex items-center gap-3 rounded-lg p-2 backdrop-blur-xl backdrop-saturate-150 sm:mx-auto sm:max-w-lg lg:hidden",
        // The mark alone is a shape rather than the head of a word, so it
        // steps up to 28 and in to 12 — nearer the 14 it sits from the top
        // and bottom of the bar, where 16 in at 24 read as drifting right.
        saved ? "pl-3" : "pl-4 max-[359px]:pl-3",
        "transition-[opacity,translate] duration-300 ease-out",
        !shown && "pointer-events-none -translate-y-4 opacity-0",
      )}
      inert={!shown}
    >
      <Logo
        className={cn(
          "shrink-0",
          saved ? "size-7" : "size-6 max-[359px]:size-7",
        )}
      />
      {/* The mark alone once a second button needs the room, and on a 320px
          phone, where the name and one button already run six pixels past
          the bar. */}
      {!saved && (
        <span className="font-heading hidden text-base font-medium tracking-tight min-[360px]:inline">
          Loopmere
        </span>
      )}

      {/* Somebody with a shelf of their own has a better first click than a
          random four: their shelf. Outlined beside the filled one, so the
          bar still has one primary — the same pair the hero draws. */}
      <div className="ml-auto flex items-center gap-2">
        {saved && (
          <Button
            aria-label={`Play your ${favorites.length} saved ${favorites.length === 1 ? "sound" : "sounds"}`}
            variant="outline"
            onClick={() => playFavourites(favorites)}
          >
            <PlayIcon />
            Saved
          </Button>
        )}

        {/* Under 360, beside Saved, the phrase runs 36px past the bar, and
            it is this label that gives: a ▶ with no word left the other
            button saying nothing about what it plays. "Shuffle" is what the
            glyph already says, with room to spare for the fallback face. */}
        <Button onClick={shuffle}>
          <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
          <span className={cn(saved && "max-[359px]:hidden")}>
            Build me a mix
          </span>
          {saved && <span className="hidden max-[359px]:inline">Shuffle</span>}
        </Button>
      </div>
    </div>
  );
}

interface TabFaceProps {
  active: boolean;
  /** A count riding the icon's corner, drawn only above nought. */
  badge?: number;
  icon: typeof FavouriteIcon;
  label: string;
}

/**
 * Icon over label, the one layout every phone's own tab bar has taught. The
 * state is carried the way the rails carry it: the brand ink on the glyph and
 * the label up to full ink, never a fill.
 */
function TabFace({ active, badge, icon, label }: TabFaceProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn("relative transition-colors", active && "text-primary-ink")}
      >
        <HugeiconsIcon className="size-6" icon={icon} strokeWidth={1.5} />

        {/* On the corner, not in the label: the label keeps its centre and
            the tab its width whatever the number is. The ring is the bar's
            own ground, so the disc reads as sitting on the glyph rather than
            as a notch taken out of it. */}
        {badge ? (
          <span className="bg-foreground text-background ring-card absolute -top-1.5 left-[calc(100%-0.5rem)] grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-medium tabular-nums ring-2">
            {badge}
          </span>
        ) : null}
      </span>

      <span className="max-w-full truncate">{label}</span>
    </>
  );
}

/** The tab's own box: the full height of the bar, so the target is the column. */
function tabClass(active: boolean) {
  return cn(
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sm text-xs font-medium transition-colors",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
  );
}

/**
 * What is playing, one tap from anywhere on the page. It exists because the
 * top bar left: under `lg` that bar was the only transport in reach once the
 * hero had scrolled away. Drawn only with something in the mix, and it rises
 * with the first card picked, which is the page answering that tap.
 *
 * The pill is not the control; the button laid over it is, under the play
 * button — the sound card's arrangement, and for the card's reason: a control
 * inside a control cannot be announced.
 */
function MiniPlayer({
  selected,
  tucked,
}: {
  selected: Array<string>;
  /** The bar has left: stay above the home indicator it was padding for. */
  tucked: boolean;
}) {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);

  const empty = selected.length === 0;
  const count = `${selected.length} ${selected.length === 1 ? "sound" : "sounds"}`;
  const names = selected.map((id) => LABELS[id]).join(", ");

  return (
    <div
      className={cn(
        // Concentric: the play button's 14.4 plus the 8 around it is 22.4,
        // and `rounded-lg` is the nearest step at 24.
        "bg-card/85 shadow-soft-lg relative mx-3 mb-2 flex items-center gap-3 rounded-lg p-2 pl-3 backdrop-blur-xl backdrop-saturate-150 sm:mx-auto sm:max-w-lg",
        "has-[[data-slot=mini-open]:hover]:bg-card transition-[opacity,translate,background-color] duration-300 ease-out",
        empty
          ? "pointer-events-none translate-y-3 opacity-0"
          : "pointer-events-auto",
        !empty && tucked && "-translate-y-[env(safe-area-inset-bottom,0px)]",
      )}
      // Invisible is not enough: at opacity 0 it still took a Tab stop.
      inert={empty}
    >
      <DrawerTrigger
        aria-label={`Open the mix, ${count}`}
        className="absolute inset-0 cursor-pointer rounded-lg"
        data-slot="mini-open"
      />

      <span aria-hidden="true" className="flex shrink-0 gap-0.5">
        {selected.slice(0, 3).map((id) => (
          <SoundIcon id={id} key={id} loading="eager" size={24} />
        ))}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{names}</span>
        <span className="text-muted-foreground block text-xs">
          {isPlaying ? "Playing" : "Paused"} · {count}
        </span>
      </span>

      <Button
        aria-label={isPlaying ? "Pause the mix" : "Play the mix"}
        className="relative z-10"
        size="icon"
        onClick={togglePlay}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </div>
  );
}

/**
 * The phone's chrome, under `lg`: a player that floats while something is in
 * the mix, and a bar of four tabs along the bottom edge — the arrangement a
 * travel or a music app has taught every thumb. It takes the place of the top
 * bar, which spent the top of a small screen on a logo and a menu button in
 * the corner furthest from the hand, and of the floating tools button, which
 * sat on top of whatever was under it.
 *
 * Every tab that is not a jump opens a sheet, so the page behind stays where
 * the reader left it.
 */
export function MobileDock() {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const { hold, tucked, untuck } = useTucked();

  const favorites = useSoundStore(useShallow((state) => state.getFavorites()));
  const selected = useSoundStore(
    useShallow((state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );

  const active = useActiveShelf(SHELF_IDS, "roadmap");
  const pastHero = usePastHero();
  const playing = selected.length > 0;

  /**
   * How much of the screen's foot the dock covers right now, for the toast
   * to rise just clear of — `--toast-bottom` in `globals.css`. The bar is 65
   * with its hairline and the player 64 with the gap under it; tucked, the
   * bar leaves one pixel. It was a fixed 144, sized for the tallest case, so
   * over a bare bar the toast floated 80px up, most of the way to the middle
   * of a phone once the browser's own toolbar had taken its share.
   */
  useEffect(() => {
    const covered = (tucked ? 1 : 65) + (playing ? 64 : 0);

    document.documentElement.style.setProperty(
      "--dock-cover",
      `${Math.max(covered + 12, 16)}px`,
    );

    return () => {
      document.documentElement.style.removeProperty("--dock-cover");
    };
  }, [playing, tucked]);

  /** An open sheet is where the reader is; otherwise the page says. */
  const here = sheet ?? (active === "favorites" ? "favorites" : "shelves");

  const control = (name: Sheet) => ({
    open: sheet === name,
    onOpenChange: (open: boolean) => setSheet(open ? name : null),
  });

  const close = () => setSheet(null);

  /** A jump the sheet or the bar asked for, so the bar holds still for it. */
  const jump = () => {
    hold();
    close();
  };

  const shelves = useMemo(
    () =>
      sounds.categories.map((category) => ({
        count: category.sounds.length,
        id: category.id,
        title: category.title,
      })),
    [],
  );

  return (
    <>
      <StartBar
        favorites={favorites}
        shown={pastHero && selected.length === 0}
      />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out lg:hidden",
          // The bar's own height, safe area and all, so no strip of empty
          // glass is left under the home indicator; the player takes the
          // safe area back and stops just above it.
          tucked && "translate-y-[calc(4rem+env(safe-area-inset-bottom,0px))]",
        )}
        onFocus={untuck}
      >
        <Drawer {...control("mix")}>
          <MiniPlayer selected={selected} tucked={tucked} />

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>The mix</DrawerTitle>
              <DrawerDescription>
                Every sound in it has a level of its own. Swipe this away and it
                keeps playing.
              </DrawerDescription>
            </DrawerHeader>

            <MixDesk empty="Nothing in the mix. Swipe this away and tap any card to start one." />

            <section className="mt-8">
              <h3 className="text-muted-foreground px-2.5 text-xs tracking-widest uppercase">
                Levels
              </h3>
              <div className="mt-4">
                <LevelSliders />
              </div>
            </section>
          </DrawerContent>
        </Drawer>

        {/* Glass over a hairline — the edge where it rests on the page — and no
            cast: it is fixed to the screen, not lifted off it. */}
        <nav
          aria-label="Quick"
          className="bg-card/85 pointer-events-auto border-t pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="mx-auto flex h-16 max-w-lg px-2">
            <Drawer {...control("shelves")}>
              <DrawerTrigger className={tabClass(here === "shelves")}>
                <TabFace
                  active={here === "shelves"}
                  icon={LibraryIcon}
                  label="Shelves"
                />
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Jump to a shelf</DrawerTitle>
                  <DrawerDescription>
                    Eight that came with the app and the one you fill yourself.
                  </DrawerDescription>
                </DrawerHeader>

                {/* Real anchors that shut the sheet on their way, not
                    `DrawerClose render={<a/>}`: that one is a button underneath,
                    and the fix Base UI suggests for it puts role="button" on the
                    link — a jump to a shelf announced as a press. The shelf in
                    view is marked the way the left rail marks it. */}
                <div className="flex flex-col gap-1">
                  {shelves.map((shelf) => (
                    <a
                      aria-current={active === shelf.id ? "true" : undefined}
                      className={cn(
                        drawerRow,
                        active === shelf.id && "bg-muted hover:bg-accent",
                      )}
                      href={`#category-${shelf.id}`}
                      key={shelf.id}
                      onClick={jump}
                    >
                      <span aria-hidden="true" className="shrink-0">
                        <SoundIcon id={shelf.id} size={24} />
                      </span>
                      {shelf.title}
                      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                        {shelf.count}
                      </span>
                    </a>
                  ))}
                </div>

                <div className="mx-2.5 mt-2 border-t pt-2">
                  <div className="-mx-2.5 flex flex-col gap-1">
                    <a
                      aria-current={active === "favorites" ? "true" : undefined}
                      className={cn(
                        drawerRow,
                        active === "favorites" && "bg-muted hover:bg-accent",
                      )}
                      href="#category-favorites"
                      onClick={jump}
                    >
                      <span aria-hidden="true" className="shrink-0">
                        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} />
                      </span>
                      Favourites
                      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                        {favorites.length}
                      </span>
                    </a>

                    {/* The floating button's other half: under `lg` there is
                        no Back to the top button left on the screen. */}
                    <button
                      className={cn(drawerRow, "text-muted-foreground")}
                      onClick={() => {
                        jump();
                        window.scrollTo({ behavior: scrollBehavior(), top: 0 });
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-6 shrink-0 place-items-center"
                      >
                        <ArrowUpIcon className="size-4" />
                      </span>
                      Back to the top
                    </button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <a
              aria-current={here === "favorites" ? "true" : undefined}
              aria-label={
                favorites.length
                  ? `Favourites, ${favorites.length} saved`
                  : "Favourites"
              }
              className={tabClass(here === "favorites")}
              href="#category-favorites"
              onClick={hold}
            >
              <TabFace
                active={here === "favorites"}
                badge={favorites.length}
                icon={FavouriteIcon}
                label="Favourites"
              />
            </a>

            <Drawer {...control("tools")}>
              <DrawerTrigger className={tabClass(here === "tools")}>
                <TabFace
                  active={here === "tools"}
                  icon={DashboardSquare02Icon}
                  label="Tools"
                />
              </DrawerTrigger>

              <DrawerContent>
                {/* No key hints: this sheet is the phone's, and a phone has no
                    keys for them to name. */}
                <ToolsSheetBody hints={false} onPick={close} />
              </DrawerContent>
            </Drawer>

            <Drawer {...control("more")}>
              <DrawerTrigger className={tabClass(here === "more")}>
                <TabFace
                  active={here === "more"}
                  icon={Menu01Icon}
                  label="More"
                />
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Loopmere</DrawerTitle>
                  <DrawerDescription>
                    Nothing to sign up for. The mix you build is written to this
                    browser and sent nowhere.
                  </DrawerDescription>
                </DrawerHeader>

                {/* The switch the left rail carries from `xl`. Under it the
                    page followed the system and nothing else. */}
                <ThemeToggle className="text-foreground hover:bg-muted gap-2.5 py-3 pr-4 [&_svg]:size-4" />

                <div className="mt-5 flex flex-col gap-1">
                  <a className={drawerRow} href="#roadmap" onClick={jump}>
                    <HugeiconsIcon
                      className="size-4 shrink-0"
                      icon={Route01Icon}
                      strokeWidth={1.5}
                    />
                    Roadmap
                  </a>

                  <a
                    className={drawerRow}
                    href={REPO_URL}
                    rel="noreferrer noopener"
                    target="_blank"
                    onClick={close}
                  >
                    <HugeiconsIcon
                      className="size-4 shrink-0"
                      icon={Github01Icon}
                      strokeWidth={1.5}
                    />
                    Source on GitHub
                  </a>

                  <a
                    className={drawerRow}
                    href={COFFEE_URL}
                    rel="noreferrer noopener"
                    target="_blank"
                    onClick={close}
                  >
                    <HugeiconsIcon
                      className="size-4 shrink-0"
                      icon={Coffee02Icon}
                      strokeWidth={1.5}
                    />
                    Buy me a coffee
                  </a>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </nav>
      </div>
    </>
  );
}
