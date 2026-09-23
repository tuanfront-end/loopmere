"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

/**
 * A bottom sheet, on Base UI's Drawer rather than shadcn's `vaul`: every other
 * wrapper in `components/ui/` is Base UI, and Base UI ships the same gesture
 * set — swipe to dismiss, snap points, and the `--drawer-*` variables the
 * styles below read.
 *
 * `--bleed` is the trick that makes it feel native. The popup is drawn 3rem
 * taller than it appears and pulled down by the same amount, so a rubber-band
 * scroll at the bottom of the sheet reveals more sheet instead of the page
 * behind it.
 */
const BLEED = "[--bleed:3rem]";

/**
 * A row in a sheet. `py-3` rather than the rails' `py-2`: a rail row is
 * pointed at with a mouse and one of these is hit with a thumb, so it clears
 * 44px. The left inset is the rails', because the group labels above it are
 * theirs too.
 */
const drawerRow =
  "flex w-full items-center gap-2.5 rounded-sm py-3 pr-4 pl-2.5 text-left text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50";

function Drawer(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
  children,
  className,
  ...props
}: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="drawer-backdrop"
        className={cn(
          BLEED,
          // A backdrop's job is to darken. `--foreground` is near-black on the
          // light side and near-white on the dark one, so it can only be the
          // ink here — on dark it becomes a real black veil instead.
          "fixed inset-0 z-50 min-h-dvh bg-foreground/25 dark:bg-black/55 supports-[-webkit-touch-callout:none]:absolute",
          // The backdrop fades with the drag rather than on a timer, so the
          // page comes back under your thumb at the speed you pull.
          "opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
          "data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
          "motion-reduce:transition-none",
        )}
      />

      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            BLEED,
            // Not a flex container. It was, and its one flex child carried
            // `min-h-0` — which is exactly the pair that lets a child be
            // squashed below its content instead of overflowing. The popup
            // then reported `scrollHeight === clientHeight`, so it never grew
            // a scrollbar, and the rows past the cap were drawn outside the
            // sheet and off the bottom of the screen with no way to reach
            // them. A scrolling box is a block.
            "bg-card text-foreground relative -mb-(--bleed) block w-full rounded-t-lg border-t outline-none",
            "max-h-[calc(85dvh+var(--bleed))] overflow-y-auto overscroll-contain touch-auto",
            // Safe area for the home indicator, plus the bleed that is never seen.
            "px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))]",
            "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            "data-swiping:select-none data-starting-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {/* The grab handle. Decorative — the whole sheet is the swipe area,
              and there is a real close control in the header. */}
          <div
            aria-hidden="true"
            className="bg-muted-foreground/25 mx-auto mb-3 h-1 w-10 shrink-0 rounded-full"
          />

          <DrawerPrimitive.Content className="flex flex-col">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("relative flex flex-col gap-1 pr-10 pb-4", className)}
      {...props}
    >
      {children}

      {/* The close control the grab handle's comment below promises, and
          which was missing from both sheets. A swipe is not a gesture every
          hand or every input can make, and a phone has no Escape key. The
          dialogs' own close button, in the same corner. */}
      <DrawerPrimitive.Close
        data-slot="drawer-close"
        render={
          <Button
            className="absolute -top-1 right-0 rounded-full"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} />
        <span className="sr-only">Close</span>
      </DrawerPrimitive.Close>
    </div>
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-xl tracking-tight", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm text-balance", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  drawerRow,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
