"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { shipped } from "@/data/roadmap";

/** Three rows of two wherever the list has two columns. */
const VISIBLE = 6;

/**
 * The one part of the roadmap that changes after the page loads, so it is the
 * one part sent to the browser. The rest of the section renders on the server.
 */
export function ShippedList() {
  const [all, setAll] = useState(false);

  const hidden = shipped.length - VISIBLE;
  const items = all ? shipped : shipped.slice(0, VISIBLE);

  return (
    <>
      {/* Two columns from `@xl`, the centre column of a 1280 or 1366 laptop.
          One column there ran six rows of short lines down 550px of a screen
          that is about 700 tall.

          The same records as the cards on the art, so the same role: a
          product object at 14, marked on its root. */}
      <ul
        className="grid gap-x-8 @xl:grid-cols-2 @3xl:gap-x-10"
        data-object
        id="roadmap-shipped"
      >
        {items.map((item) => (
          <li className="flex gap-3 border-b py-4" key={item.id}>
            <HugeiconsIcon
              aria-hidden="true"
              className="text-primary-ink mt-0.5 size-4 shrink-0"
              icon={Tick02Icon}
              strokeWidth={2}
            />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground mt-1 text-sm text-balance">
                {item.blurb}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <div className="mt-6">
          <Button
            aria-controls="roadmap-shipped"
            aria-expanded={all}
            size="sm"
            variant="outline"
            onClick={() => setAll((previous) => !previous)}
          >
            {all ? "Show fewer" : `Show ${hidden} more`}
            {all ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      )}
    </>
  );
}
