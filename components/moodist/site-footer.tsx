import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { Logo } from "./logo";

import {
  CC0_URL,
  PIXABAY_LICENCE_URL,
  REPO_URL,
  THIINGS_URL,
  UPSTREAM_AUTHOR_URL,
  UPSTREAM_URL,
} from "@/constants/links";
import { sounds } from "@/data/sounds";
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

          <p className="text-muted-foreground mt-4 max-w-[38ch] text-sm">
            {count()} loops on {sounds.categories.length} shelves, each with its
            own volume. Whatever you build is written to this browser and sent
            nowhere — there is no account here to send it to.
          </p>
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
      <div className="border-border mt-16 flex flex-col gap-2 border-t pt-8 pb-20 text-xs sm:pb-12">
        <p className="text-muted-foreground">
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

        <p className="text-muted-foreground">
          A port kept for study, not for sale: an Astro app rebuilt in Next.js
          without its islands.
        </p>
      </div>
    </footer>
  );
}
