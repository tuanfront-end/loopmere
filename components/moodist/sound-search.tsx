"use client";

import { XMarkIcon } from "@heroicons/react/16/solid";
import {
  FavouriteIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";

import { SoundIcon } from "./sound-icon";

import { Input } from "@/components/ui/input";
import { SOUND_URL } from "@/constants/links";
import { SOUND_COUNT, searchSounds, type SoundMatch } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

const RESULT = "[data-slot=search-result]";

/**
 * Enter in the field: the best match, sounding. Never the toggle, which on a
 * sound already in the mix would take out the one thing just asked for by
 * name. A quietened one comes back; a stopped mix starts.
 */
function startSound(id: string) {
  const { locked, play, select, sounds, togglePause } =
    useSoundStore.getState();

  if (locked) return;

  if (!sounds[id].isSelected) select(id);
  else if (sounds[id].isPaused) togglePause(id);

  play();
}

/** The card's own toggle, for a sound found by name rather than on a shelf. */
function toggleSound(id: string) {
  const { locked, play, select, sounds, unselect } = useSoundStore.getState();

  if (locked) return;

  if (sounds[id].isSelected) unselect(id);
  else {
    select(id);
    play();
  }
}

interface SearchFieldProps {
  className?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (query: string) => void;
  /** Draws the `/` hint, where the shortcut can reach the field. */
  shortcut?: boolean;
  value: string;
}

export function SearchField({
  className,
  inputRef,
  onChange,
  shortcut = false,
  value,
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <HugeiconsIcon
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
        icon={Search01Icon}
        strokeWidth={1.75}
      />

      <Input
        aria-label="Search sounds"
        // The browser's own clear control is hidden: the one below is drawn
        // in the house style and puts focus back in the field.
        className="pr-10 pl-10 [&::-webkit-search-cancel-button]:appearance-none"
        enterKeyHint="search"
        placeholder={`Search ${SOUND_COUNT} sounds`}
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          // Typing here is typing, not shortcuts.
          if (event.key !== "Escape") event.stopPropagation();

          const results = event.currentTarget
            .closest("[data-search]")
            ?.querySelectorAll<HTMLButtonElement>(RESULT);

          if (event.key === "ArrowDown" && results?.length) {
            event.preventDefault();
            results[0].focus();
          } else if (event.key === "Enter" && results?.length) {
            event.preventDefault();
            startSound(results[0].dataset.id!);
          } else if (event.key === "Escape" && value) {
            // A first Escape clears the search; only an empty field lets it
            // through to close the sheet it sits in.
            event.stopPropagation();
            onChange("");
          }
        }}
      />

      {value ? (
        <button
          aria-label="Clear the search"
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-sm transition-colors outline-none focus-visible:ring-3"
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <XMarkIcon className="size-4" />
        </button>
      ) : (
        shortcut && (
          <kbd
            aria-hidden="true"
            className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm px-2 py-0.5 font-sans text-xs font-medium"
          >
            /
          </kbd>
        )
      )}
    </div>
  );
}

function Status({ id }: { id: string }) {
  const isSelected = useSoundStore((state) => state.sounds[id].isSelected);
  const isPaused = useSoundStore((state) => state.sounds[id].isPaused);
  const isPlaying = useSoundStore((state) => state.isPlaying);

  if (!isSelected) {
    // Out of the mix there is no state to report, only what a press does,
    // and that only to the row under the pointer or the focus.
    return (
      <HugeiconsIcon
        aria-hidden="true"
        className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover/result:opacity-100 group-focus-visible/result:opacity-100"
        icon={PlusSignIcon}
        strokeWidth={1.75}
      />
    );
  }

  if (isPaused || !isPlaying) {
    return (
      <span className="text-muted-foreground shrink-0 text-xs">
        {isPaused ? "Quiet" : "In the mix"}
      </span>
    );
  }

  return (
    <span className="text-primary-ink flex shrink-0 items-center gap-1.5 text-xs font-medium">
      <span
        aria-hidden="true"
        className="bg-primary size-1.5 rounded-full motion-safe:animate-pulse"
      />
      Playing
    </span>
  );
}

function ResultRow({ match }: { match: SoundMatch }) {
  const isSelected = useSoundStore(
    (state) => state.sounds[match.id].isSelected,
  );
  const isPaused = useSoundStore((state) => state.sounds[match.id].isPaused);
  const isFavorite = useSoundStore(
    (state) => state.sounds[match.id].isFavorite,
  );
  const locked = useSoundStore((state) => state.locked);

  return (
    <li>
      <button
        aria-pressed={isSelected}
        className="group/result hover:bg-accent focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
        data-id={match.id}
        data-slot="search-result"
        disabled={locked}
        type="button"
        onClick={() => toggleSound(match.id)}
      >
        {/* The card's reading of a quietened sound: the render recedes. */}
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-opacity",
            isSelected && isPaused && "opacity-55",
          )}
        >
          <SoundIcon id={match.id} size={24} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {match.label}
          </span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <span className="truncate">{match.category}</span>
            {isFavorite && (
              <>
                <HugeiconsIcon
                  aria-hidden="true"
                  className="text-coral-ink fill-coral/40 size-3 shrink-0"
                  icon={FavouriteIcon}
                  strokeWidth={1.75}
                />
                <span className="sr-only">, a favourite</span>
              </>
            )}
          </span>
        </span>

        <Status id={match.id} />
      </button>
    </li>
  );
}

interface SearchResultsProps {
  className?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
}

/**
 * What the field finds, drawn where the shelves were. A press on a row is a
 * press on that sound's card: into the mix and playing, or out of it.
 */
export function SearchResults({
  className,
  inputRef,
  query,
}: SearchResultsProps) {
  const matches = useMemo(() => searchSounds(query), [query]);

  return (
    <div
      className={cn("flex min-h-0 flex-col", className)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

        const rows = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(RESULT),
        );
        const at = rows.indexOf(document.activeElement as HTMLButtonElement);

        if (at === -1) return;

        event.preventDefault();

        if (event.key === "ArrowDown")
          rows[Math.min(at + 1, rows.length - 1)].focus();
        else if (at === 0) inputRef.current?.focus();
        else rows[at - 1].focus();
      }}
    >
      <p
        aria-live="polite"
        className="text-muted-foreground shrink-0 px-2.5 pb-2 text-xs"
      >
        {matches.length === 0
          ? "Nothing by that name."
          : matches.length === 1
            ? "1 sound"
            : `${matches.length} sounds`}
      </p>

      {matches.length > 0 ? (
        // The negative margin and the padding cancel, as on the shelf list:
        // without them the scroller clips a row's focus ring.
        <ul className="no-scrollbar -mx-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto px-1">
          {matches.map((match) => (
            <ResultRow key={match.id} match={match} />
          ))}
        </ul>
      ) : (
        <p className="px-2.5 text-sm text-balance">
          Missing a sound?{" "}
          <a
            className="hover:text-primary-ink underline underline-offset-4 transition-colors"
            href={SOUND_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            Tell us which one
          </a>
          .
        </p>
      )}
    </div>
  );
}
