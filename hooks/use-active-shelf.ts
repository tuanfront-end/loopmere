"use client";

import { useEffect, useState } from "react";

/**
 * Which shelf the reader is actually looking at, so the rail answers the
 * scroll rather than only the click. No JavaScript means no highlight, which
 * is the rail as it was before — never a rail with nothing in it.
 *
 * The last shelf whose top has crossed a line a third down the screen, read
 * on each frame the page moves. An `IntersectionObserver` over a narrow band
 * was the first attempt and it lit the wrong row: past the final shelf no
 * section is inside the band at all, so the callback stops firing and the
 * highlight stays wherever it was when the reader left the band. Measuring
 * answers every scroll position, including the ones with nothing in view.
 *
 * `end` is the section after the last shelf. Once it crosses the line the
 * reader has left the shelves, and no row stays lit to say otherwise.
 *
 * Two readers: the left rail from `xl`, and the phone's tab bar and its
 * shelf sheet under `lg`.
 */
export function useActiveShelf(ids: Array<string>, end: string) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join();

  useEffect(() => {
    const shelves = key.split(",");

    /**
     * Nine reads with no write between them, so one layout answers all nine
     * and the browser has already coalesced the scroll events down to the
     * frame rate. A `requestAnimationFrame` gate on top of that buys a flag to
     * get wrong rather than any measurable work.
     */
    const measure = () => {
      const line = window.innerHeight / 3;
      let current: string | null = null;

      for (const id of shelves) {
        const section = document.getElementById(`category-${id}`);

        if (section && section.getBoundingClientRect().top <= line) {
          current = id;
        }
      }

      const after = document.getElementById(end);

      if (after && after.getBoundingClientRect().top <= line) {
        current = null;
      }

      setActive(current);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [end, key]);

  return active;
}
