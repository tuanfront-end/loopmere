// ref: feature-sections/bracketed-eyebrow-and-accordion-left-framed-invoice-card-right.jpeg — split 50/50 · right-heavy (departed: the accordion becomes a Later card stacked under Next inside the frame, and Shipped runs full width under both columns)

import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Github01Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ShippedList } from "./roadmap-shipped";

import { buttonVariants } from "@/components/ui/button";
import {
  REPO_URL,
  SUGGEST_URL,
  UPSTREAM_ISSUES_URL,
} from "@/constants/links";
import { later, next, shipped, type RoadmapItem } from "@/data/roadmap";

const WORDS = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
];

/** Spelled out while it fits a sentence, digits once it does not. */
const spell = (n: number) => WORDS[n] ?? String(n);

/** Month and year of the oldest shipped item, read in UTC so the server and
    every reader's timezone print the same month. */
function firstMonth() {
  const [year, month] = (shipped.at(-1)?.shipped ?? "2026-09")
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** A follow link once an item has its issue; nothing until then, because a
    link to a page that does not exist is worse than no link. */
function Follow({ item }: { item: RoadmapItem }) {
  if (!item.issue) return null;

  return (
    <a
      className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 rounded-full text-xs transition-colors"
      href={`${REPO_URL}/issues/${item.issue}`}
      rel="noreferrer noopener"
      target="_blank"
    >
      Follow on GitHub
      <ArrowUpRightIcon aria-hidden="true" className="size-3" />
    </a>
  );
}

/**
 * One card on the art, and a product object: its rows are records out of
 * `data/roadmap.ts`, read in passing, so they sit at 14 and the card says what
 * it is with `data-object`. The heading and the lede above make the section's
 * case, and they are the 16.
 *
 * The list bleeds by the rows' own padding, so a row's text lands on the
 * card's padding edge under the title while its ground runs to 6px from the
 * card — the hero panels' rule, and the reason the rows' corners run parallel
 * to the card's.
 */
function Card({
  caption,
  children,
  title,
}: {
  caption: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="bg-card shadow-soft-lg rounded-md p-4" data-object>
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-0.5 text-sm">{caption}</p>
      {children}
    </div>
  );
}

/** A disc the width of the row's marker, so every row's text starts on one
    line whether the marker is a number or a glyph. */
function Marker({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="bg-card text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums"
    >
      {children}
    </span>
  );
}

function Row({
  item,
  marker,
}: {
  item: RoadmapItem;
  marker: React.ReactNode;
}) {
  return (
    <li className="bg-accent flex gap-3 rounded-sm p-2.5">
      <Marker>{marker}</Marker>
      <div>
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-muted-foreground mt-1 text-sm text-balance">
          {item.blurb}
        </p>
        <Follow item={item} />
      </div>
    </li>
  );
}

/**
 * What shipped, what is next and what comes later, at the foot of the page.
 *
 * Next is the focal card because it is the promise; Shipped is the proof and
 * sits below as a plain list; the one action sits under the heading, where a
 * reader meets it before any list. Two other layouts were built and set aside
 * — a board of three tinted panels, which left two 260px columns at 1280, and
 * a ledger behind tabs, which hid Shipped and Later behind a click.
 *
 * The frame is the section's picture. It ends the run of shelves that carry
 * none, so it wears `data-picture` for `page-check`.
 */
export function Roadmap() {
  return (
    <section
      aria-labelledby="roadmap-heading"
      className="mx-auto w-full max-w-[1200px] px-6 sm:px-8"
      id="roadmap"
    >
      <div className="@3xl:grid @3xl:grid-cols-2 @3xl:items-center @3xl:gap-x-12">
        <div>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Roadmap
          </p>

          <h2
            className="mt-4 text-3xl tracking-tight text-balance @xl:text-4xl @xl:tracking-tighter"
            id="roadmap-heading"
          >
            {spell(shipped.length)} changes so far.{" "}
            {spell(next.length + later.length)} on the way.
          </h2>

          <p className="text-muted-foreground mt-4 max-w-[52ch] text-base text-balance">
            The loops and the tools come from Moodist, by MAZE. Below is what
            we added on top of them, and what we build next.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3">
            <a
              className={buttonVariants({ size: "lg" })}
              href={SUGGEST_URL}
              rel="noreferrer noopener"
              target="_blank"
            >
              <HugeiconsIcon icon={Github01Icon} strokeWidth={1.5} />
              Suggest something
            </a>

            <p className="text-muted-foreground text-sm">
              It opens on GitHub and needs a free account.
            </p>

            {/* New sounds are Moodist's to add, so the request goes there —
                the issue chooser on this repo says the same. One line, because
                it is fine print under the call to action; the lede has already
                said whose the loops are. */}
            <p className="text-muted-foreground text-sm">
              Missing a sound?{" "}
              <a
                className="hover:text-foreground rounded-full underline underline-offset-4 transition-colors"
                href={UPSTREAM_ISSUES_URL}
                rel="noreferrer noopener"
                target="_blank"
              >
                Ask Moodist for it
              </a>
              .
            </p>
          </div>
        </div>

        {/* `xl`, the hero frame's corner, over cards at `md`: 14 of padding
            is exactly concentric, and the 20 from `@xl` leaves the corners 2px
            wider than the sides, which the eye reads as the same curve. The
            rows sit `sm`, 6 inside the cards. It was `2xl` from `@xl` — 43px
            on a frame this size read soft next to everything else here. */}
        <div
          className="from-brand-art-soft to-brand-art mt-10 flex flex-col gap-3 rounded-xl bg-linear-to-br p-3.5 @xl:p-5 @3xl:mt-0"
          data-picture
        >
          <Card caption="Picked to build next, three at a time." title="Next">
            <ol className="-mx-2.5 mt-3 -mb-2.5 flex flex-col gap-1">
              {next.map((item, index) => (
                <Row item={item} key={item.id} marker={index + 1} />
              ))}
            </ol>
          </Card>

          <Card caption="Decided on, with no date yet." title="Later">
            <ul className="-mx-2.5 mt-3 -mb-2.5 flex flex-col gap-1">
              {later.map((item) => (
                <Row
                  item={item}
                  key={item.id}
                  marker={
                    <HugeiconsIcon
                      className="size-3.5"
                      icon={HourglassIcon}
                      strokeWidth={1.5}
                    />
                  }
                />
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-16 @3xl:mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-4">
          <h3 className="text-lg font-medium tracking-tight">
            Shipped since {firstMonth()}
          </h3>
          <p className="text-muted-foreground text-sm">
            Merged, and live on this page.
          </p>
        </div>

        <ShippedList />
      </div>
    </section>
  );
}
