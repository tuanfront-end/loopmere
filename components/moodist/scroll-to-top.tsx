"use client";

import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { scrollBehavior } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Button
      aria-label="Back to the top"
      // This one floats over the page, so it rests with the cast the others
      // only take on hover. It goes up a step rather than sideways: without
      // this, hovering the only button on screen changed nothing.
      className={cn(
        "shadow-soft hover:shadow-soft-lg",
        !show && "pointer-events-none opacity-0",
      )}
      // Invisible is not enough: at opacity 0 it still took a Tab stop, a
      // focus ring around nothing at the top of the page.
      inert={!show}
      size="icon"
      variant="outline"
      onClick={() => window.scrollTo({ behavior: scrollBehavior(), top: 0 })}
    >
      <ChevronUpIcon />
    </Button>
  );
}
