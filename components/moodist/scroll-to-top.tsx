"use client";

import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
      className={cn(
        "shadow-soft transition-opacity",
        !show && "pointer-events-none opacity-0",
      )}
      size="icon"
      variant="outline"
      onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
    >
      <ChevronUpIcon />
    </Button>
  );
}
