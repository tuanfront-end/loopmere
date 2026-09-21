"use client";

import { Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { type IconSet, useIconSet } from "./icon-set";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SETS: Array<{ blurb: string; id: IconSet; label: string }> = [
  {
    blurb: "9,072 line icons, one drawing style, ships with the repo.",
    id: "phosphor",
    label: "Phosphor",
  },
  {
    blurb: "3D renders from thiings.co. Free for personal use only.",
    id: "thiings",
    label: "Thiings",
  },
];

/** Build scaffolding. Delete `components/dev/` and this goes with it. */
export function SwitchControl() {
  const [open, setOpen] = useState(false);
  const { set, setSet } = useIconSet();

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-card shadow-soft-lg w-72 rounded-lg p-5">
          <p className="text-xs font-medium">Icon set</p>

          <div className="mt-4 flex flex-col gap-1">
            {SETS.map((option) => (
              <button
                key={option.id}
                className={cn(
                  "rounded-sm p-3 text-left transition-colors",
                  set === option.id
                    ? "bg-accent hover:bg-muted"
                    : "hover:bg-accent",
                )}
                onClick={() => setSet(option.id)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full",
                      set === option.id ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  {option.label}
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  {option.blurb}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        aria-expanded={open}
        aria-label={open ? "Close the build switch" : "Open the build switch"}
        size="icon"
        variant="outline"
        onClick={() => setOpen((previous) => !previous)}
      >
        <HugeiconsIcon icon={Settings02Icon} strokeWidth={1.5} />
      </Button>
    </div>
  );
}
