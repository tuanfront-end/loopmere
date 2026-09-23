import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/**
 * Radius lives here and nowhere else: every button in the app reads it, so
 * there is one value to change and no call site that can drift. `rounded-sm`
 * is 14.4px — a third of a 44px control's short side, and the same step the
 * rail rows, the category pills and the sound cards' own rows take.
 *
 * It is a wider reading of the radius rule than the rule's own advice, which
 * calls `rounded-full` the better of the two under 40px: an icon button at
 * size-9 lands at 40% of its short side rather than a third. That is the
 * price of one radius across the whole set, and it is the trade this project
 * has chosen.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity,translate] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        // The ground does not move and the edge does not colour: white at
        // rest, white under the pointer, and what changes is that it lifts.
        // That is the depth rule read straight — a hairline where something
        // sits on the surface, one soft shadow where it has left it, never
        // both — and it is the one hover in this set that spends no colour.
        //
        // A card takes a brand edge because hovering one previews the pick it
        // is about to become. A button has no such state to preview; it is
        // pressed and it is done, so the only thing its hover has to say is
        // that it is a thing you can press.
        //
        // `bg-muted` was the version before last and it was the worst of the
        // three: six rungs below the page from a rest one rung above it, so
        // the control read as already pressed — and it is the exact ground of
        // a slider track and a heart, the one colour hover here has to avoid.
        outline:
          "border-border bg-card hover:border-transparent hover:shadow-soft hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        sm: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-11 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
