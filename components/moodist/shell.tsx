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

      {/* A grid with its three tracks declared, not a row of flex items. The
          right rail sits after half a megabyte of centre-column HTML, so as a
          flex item it arrived late: the first paint gave the centre the whole
          width and then took 340px of it back — a layout shift of 0.15 to 0.17
          at 1280 and 1440. Declared tracks hold the space before the rail
          exists; measured, the shift is 0. */}
      <div className="flex w-full items-start xl:grid xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-3 xl:px-3 2xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside
          aria-label="Shelves and settings"
          className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-[280px] shrink-0 xl:block 2xl:w-[300px]"
        >
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
