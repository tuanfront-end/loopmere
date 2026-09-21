import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Coffee02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Logo } from "./logo";

import { buttonVariants } from "@/components/ui/button";
import {
  CC0_URL,
  COFFEE_URL,
  PIXABAY_LICENCE_URL,
  REPO_URL,
  THIINGS_URL,
  UPSTREAM_AUTHOR_URL,
  UPSTREAM_URL,
} from "@/constants/links";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { count } from "@/lib/sounds";

const linkClass =
  "text-muted-foreground hover:text-foreground rounded-full transition-colors";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground text-xs tracking-widest uppercase">
      {children}
    </h2>
  );
}

function Outbound({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      className={`${linkClass} inline-flex items-center gap-1.5`}
      href={href}
      rel="noreferrer noopener"
      target="_blank"
    >
      {children}
      <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-3.5" />
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">
      {/* The rule the footer always takes off the section above it. */}
      <div className="bg-border h-px" />

      <div className="grid gap-12 pt-16 @xl:grid-cols-2 @4xl:grid-cols-[1.5fr_1.6fr_1fr] @4xl:gap-10">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="size-6" />
            <span className="font-heading text-base font-medium tracking-tight">
              Moodist
            </span>
          </div>

          <p className="text-muted-foreground mt-4 max-w-[38ch] text-sm text-balance">
            {count()} loops on {sounds.categories.length} shelves, each with its
            own volume. Whatever you build is written to this browser and sent
            nowhere — there is no account here to send it to.
          </p>

          {/* The name first and the button under it. "Buy me a coffee" in a
              footer that credits MAZE in three other places needs an
              antecedent, and this is the only column that is about whoever
              built this one. */}
          <p className="text-muted-foreground mt-6 text-sm">
            Built by Boolii Studio.
          </p>

          <a
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "mt-3",
            )}
            href={COFFEE_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <HugeiconsIcon icon={Coffee02Icon} strokeWidth={1.5} />
            Buy me a coffee
          </a>
        </div>

        <nav aria-labelledby="footer-shelves">
          <Eyebrow>
            <span id="footer-shelves">Shelves</span>
          </Eyebrow>

          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {sounds.categories.map((category) => (
              <li key={category.id}>
                <a className={linkClass} href={`#category-${category.id}`}>
                  {category.title}
                  <span className="ml-1.5 text-xs tabular-nums opacity-60">
                    {category.sounds.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-source">
          <Eyebrow>
            <span id="footer-source">Where it came from</span>
          </Eyebrow>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <li>
              <Outbound href={REPO_URL}>This port</Outbound>
            </li>
            <li>
              <Outbound href={UPSTREAM_URL}>The Astro original</Outbound>
            </li>
            <li>
              <Outbound href={UPSTREAM_AUTHOR_URL}>Maze, who wrote it</Outbound>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sitting 20 below at mobile so the floating tools button has somewhere
          to land that is not on top of the small print. */}
      {/* Two things, and the first is the one that matters. Unconstrained,
          the licence line ran a **928px** measure at 1024 — about 150
          characters to the line, twice what anybody reads — and then ended on
          80px of it. `max-w-[68ch]` is the fix for the measure; `text-balance`
          on each paragraph is the fix for the tail, and it is set on the
          paragraphs rather than on this box because balancing is a decision a
          block makes about its own lines.

          And `text-sm`, not `text-xs`: `type-check` reads a measure on
          `text-xs` as a category error and it is right to. A block that needs
          telling where to wrap is copy, copy stops at `text-sm`, and `text-xs`
          is for a label that fits on one line. The step down to small print is
          carried by the ink instead. */}
      <div className="border-border mt-16 flex max-w-[68ch] flex-col gap-2 border-t pt-8 pb-20 text-sm sm:pb-12">
        <p className="text-muted-foreground text-balance">
          Code under the{" "}
          <a
            className={`${linkClass} underline underline-offset-4`}
            href={`${REPO_URL}/blob/main/LICENSE`}
            rel="noreferrer noopener"
            target="_blank"
          >
            MIT licence
          </a>
          , © 2023 MAZE. Sounds under the{" "}
          <a
            className={`${linkClass} underline underline-offset-4`}
            href={PIXABAY_LICENCE_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            Pixabay Content Licence
          </a>{" "}
          and{" "}
          <a
            className={`${linkClass} underline underline-offset-4`}
            href={CC0_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            CC0
          </a>
          . Sound icons by{" "}
          <a
            className={`${linkClass} underline underline-offset-4`}
            href={THIINGS_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            Thiings
          </a>
          , licensed for personal use and therefore kept out of this repository.
        </p>

        <p className="text-muted-foreground text-balance">
          A port kept for study, not for sale: an Astro app rebuilt in Next.js
          without its islands.
        </p>
      </div>
    </footer>
  );
}
