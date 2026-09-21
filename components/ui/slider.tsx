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
      thumbAlignment="edge"
      {...props}
    >
      {/* No blanket opacity on the Control. A disabled slider here is shown on
          every card that is not in the mix, so each part recedes on its own
          terms: the rail stays, the fill stops being brand, the thumb stops
          looking raised. */}
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
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
            className="relative block size-6 shrink-0 rounded-full bg-card shadow-soft ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none data-disabled:hover:ring-0"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
