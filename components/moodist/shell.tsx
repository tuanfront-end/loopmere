import { LeftRail } from "./left-rail";
import { RightRail } from "./right-rail";
import { SiteHeader } from "./site-header";

/**
 * Left, centre, right — and one breakpoint rather than two.
 *
 * Below `xl` neither rail fits beside a grid of cards, so the whole shell
 * folds back to the single column that shipped before it: the top bar carries
 * the brand and the transport, and the floating button carries the tools. Two
 * arrangements, each complete on its own; what does not exist is a width where
 * half the chrome has gone missing.
 *
 * The rails are panels on the page rather than columns divided by a rule. A
 * card is only a whisper above this background, so each one takes the hairline
 * the ladder asks for, and `h-[calc(100dvh-1.5rem)]` leaves the 12px margin
 * visible at the top and bottom of the screen the whole way down.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      <div className="flex w-full items-start xl:gap-3 xl:px-3">
        <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-[280px] shrink-0 xl:block 2xl:w-[300px]">
          <div className="bg-card h-full rounded-lg border">
            <LeftRail />
          </div>
        </aside>

        {/* The grid inside reads this box, not the viewport: with two rails
            beside it the centre is nothing like the window width. */}
        <div className="@container min-w-0 flex-1">{children}</div>

        <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-[340px] shrink-0 xl:block 2xl:w-[360px]">
          <div className="bg-card h-full rounded-lg border">
            <RightRail />
          </div>
        </aside>
      </div>
    </>
  );
}
