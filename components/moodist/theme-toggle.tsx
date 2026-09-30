"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useTheme } from "./theme-provider";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * The row is a `<label>` and the switch is the control inside it, so the text
 * and the track are one hit target rather than a 32px sliver with a dead word
 * beside it. Drawn as a row — tint on hover, flat, no cast — because that is
 * what everything else in the left rail and the phone's More sheet does. The
 * caller sets the row's height: a rail row is pointed at, a sheet row is hit
 * with a thumb.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <label
      className={cn(
        "hover:bg-accent text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-3 rounded-sm py-2.5 pr-2 pl-2.5 text-sm font-medium transition-colors",
        className,
      )}
    >
      <span aria-hidden="true" className="shrink-0">
        <HugeiconsIcon
          className="size-5"
          icon={isDark ? Moon02Icon : Sun03Icon}
          strokeWidth={1.5}
        />
      </span>
      Dark mode
      <Switch
        aria-label="Dark mode"
        checked={isDark}
        className="ml-auto"
        onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
      />
    </label>
  );
}
