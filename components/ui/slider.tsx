import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
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

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      // Edge alignment, set after hydration. Plain "edge" positions each thumb
      // before React loads with an inline script per slider — eighty-six of
      // them, parsed and run while the HTML streams, a quarter of the main
      // thread's load-time work on a slow phone. The thumbs land in the same
      // place; they appear a moment later.
      thumbAlignment="edge-client-only"
      {...props}
    >
      {/* No blanket opacity on the Control. A disabled slider here is shown on
          every card that is not in the mix, so each part recedes on its own
          terms: the rail stays, the fill stops being brand, the thumb stops
          looking raised. */}
      {/* `min-h-6` is the thumb's own height. Without it the control's box is
          the 4px track and the 24px thumb overflows it by ten pixels at each
          end — so a row declaring `p-3` left the thumb **three** pixels off
          its bottom edge, and the gap between two rows was measured from a
          rail nobody can see rather than from the circle they can. Reserved
          here rather than at each call site, because every call site was
          getting it wrong in a different way. */}
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-horizontal:min-h-6 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full data-disabled:bg-muted-foreground/15"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            getAriaLabel={thumbLabel}
            key={index}
            // The thumb is the same object whether the slider is live or not:
            // same 24px, same white, same cast. Only what it sits on says
            // which — the indicator behind it keeps the brand hue for a live
            // slider and drops to a neutral for a disabled one. It used to
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
            className="relative block size-6 shrink-0 rounded-full bg-card shadow-soft dark:bg-foreground transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 hover:ring-primary/45 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-hidden active:ring-3 active:ring-primary/70 disabled:pointer-events-none data-disabled:hover:ring-0"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
