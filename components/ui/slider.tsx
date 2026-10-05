import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

/**
 * The value text for a level between 0 and 1. Without it the slider announces
 * the raw float — "0.8999999761581421" for what the screen shows as 90%.
 */
export const PERCENT = {
  style: "percent",
} as const satisfies Intl.NumberFormatOptions;

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  idle = false,
  centred = false,
  valueText,
  ...props
}: SliderPrimitive.Root.Props & {
  /**
   * A position either side of a middle rather than an amount — a balance. No
   * fill, which would read as a level growing from the left, a notch at the
   * middle of the rail for the thumb to be measured against, and a 16px thumb:
   * it sits under a level, and is the lesser of the two.
   */
  centred?: boolean;
  /** The words a screen reader says for a value, where a number format will not do. */
  valueText?: (value: number) => string;
  /**
   * Live, but not in use yet — a sound card's level before the sound is in
   * the mix. The fill drops to the neutral a disabled one takes, and the rail
   * lets a vertical swipe through to the page, so a thumb scrolling a phone's
   * shelf can land on it without setting anything.
   */
  idle?: boolean;
}) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  // Base UI draws a real `<input type="range">` inside each thumb, and that
  // input is what a screen reader lands on — an `aria-label` written at the
  // call site sits on the Root and never reaches it. Carry it down. Two
  // thumbs get a number each, or both read as the same control.
  const label = props["aria-label"];
  const thumbLabel =
    label && _values.length > 1
      ? (index: number) => `${label} ${index + 1}`
      : label
        ? () => label
        : undefined;

  const vertical = props.orientation === "vertical";

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      // Centre alignment, with the edge geometry drawn in CSS below. Base UI's
      // two edge modes measure the thumb against the control in JavaScript —
      // once after mount, then only when the value moves — and the
      // ResizeObserver meant to catch everything else never attaches outside
      // Strict Mode: it is set up in the thumb's layout effect, which runs
      // before the control's ref does. So a slider that mounted at zero width
      // stayed hidden for good. Every card behind a shelf's Show more mounts
      // inside `display: none`, measured NaN, and came out with no thumb once
      // revealed — in the production build only, which is why dev never
      // showed it. Nothing here measures now: the thumb is in place in the
      // server's HTML, hidden or not, with no inline script per slider either.
      thumbAlignment="center"
      {...props}
    >
      {/* No blanket opacity on the Control. An idle slider is shown on every
          card that is not in the mix, so each part recedes on its own terms:
          the rail stays and the fill stops being brand, while the thumb keeps
          its shape and its hover — it is still the thing to reach for. */}
      {/* `min-h-6` is the thumb's own height. Without it the control's box is
          the 4px track and the 24px thumb overflows it by ten pixels at each
          end — so a row declaring `p-3` left the thumb **three** pixels off
          its bottom edge, and the gap between two rows was measured from a
          rail nobody can see rather than from the circle they can. Reserved
          here rather than at each call site, because every call site was
          getting it wrong in a different way. */}
      {/* Edge alignment in three declarations, each half the thumb: the
          control's padding, which Base UI subtracts when it turns a pointer
          into a value; the track's negative margin, which hands the drawn
          rail its full length back; and the thumb rail's inset, which is the
          box a thumb's `left: n%` resolves against. At 0 the thumb's edge
          meets the rail's, at 100 the other edge, and a press lands the
          thumb's centre under the pointer — the same geometry the measured
          mode drew. The fill still stops at n% of the full rail, which is
          always under the thumb: never more than a radius from its centre. */}
      <SliderPrimitive.Control
        className={cn(
          "relative flex w-full items-center select-none data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-vertical:py-3",
          // Half the thumb each side, so the geometry below holds at either size.
          centred
            ? "data-horizontal:min-h-4 data-horizontal:px-2"
            : "data-horizontal:min-h-6 data-horizontal:px-3",
          idle ? "touch-pan-y" : "touch-none",
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:-my-3 data-vertical:h-full data-vertical:w-1",
            centred ? "data-horizontal:-mx-2" : "data-horizontal:-mx-3",
          )}
        >
          {!centred && (
            <SliderPrimitive.Indicator
              data-slot="slider-range"
              className={cn(
                "bg-primary select-none data-horizontal:h-full data-vertical:w-full data-disabled:bg-muted-foreground/15",
                idle && "bg-muted-foreground/15",
              )}
            />
          )}
        </SliderPrimitive.Track>
        {centred && (
          <span
            aria-hidden="true"
            className="bg-muted-foreground/40 pointer-events-none absolute top-1/2 left-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {/* The thumb rail: the travel, a thumb's radius in from each end. */}
        <div
          className={cn(
            "absolute",
            vertical
              ? "inset-x-0 inset-y-3"
              : centred
                ? "inset-x-2 inset-y-0"
                : "inset-x-3 inset-y-0",
          )}
        >
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              getAriaLabel={thumbLabel}
              getAriaValueText={
                valueText ? (_, value) => valueText(value) : undefined
              }
              key={index}
              // The thumb is the same object whether the slider is live or not:
              // same 24px, same white, same cast. Only what it sits on says
              // which — the indicator behind it keeps the brand hue for a slider
              // in use and drops to a neutral for an idle or disabled one. It used to
              // shrink to a flat 12px grey dot, which read as a different
              // control and jumped size the moment a sound joined the mix.
              //
              // The ring still comes off: that one is behaviour, not shape.
              //
              // Three ring colours, and the variant order decides between them
              // rather than the order they are written in: `focus-visible` is
              // sorted after `hover`, and `active` after both. So the pointer
              // gets a faint brand halo, the keyboard keeps `--ring` — which is
              // the app's focus colour everywhere else and already brand ink —
              // and a thumb being dragged deepens. It used to be one neutral at
              // half alpha for all three, which said a control was live without
              // saying whose.
              // `bg-card` is the top of the light ladder and the *bottom* of the
              // dark one, so on dark the thumb came out darker than the track it
              // rides and vanished. What it has to be on either side is the
              // brightest thing in the control, which on dark is the ink.
              className={cn(
                centred ? "size-4" : "size-6",
                "relative block shrink-0 rounded-full bg-card shadow-soft dark:bg-foreground transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 hover:ring-primary/45 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-hidden active:ring-3 active:ring-primary/70 disabled:pointer-events-none data-disabled:hover:ring-0",
              )}
            />
          ))}
        </div>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
