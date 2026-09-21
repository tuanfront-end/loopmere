# slider

2026-09-21 — golden pair via CLI (one conflict, hand-resolved). Anatomy changed; both of this project's changes were replayed onto it.

## Changed

`components/ui/slider.tsx` — Base UI wraps the track in
`SliderPrimitive.Control` and renames `Range` to `Indicator`. Took that
anatomy whole, then carried across the two project changes: the track height
and the thumb at `size-6 bg-card shadow-soft` with no border, which is the
style's rule for a raised control.

The track is `h-1` (4px), down from the `h-1.5` this report first recorded.
Shipping a disabled slider on every unplayed card is what moved it: eighty of
them at 6px read as a row of rules across the shelf, where 4 reads as a rail
the thumb sits on.

`components/moodist/volume-slider.tsx:29`,
`components/moodist/modals/settings.tsx:41`,
`components/moodist/modals/tone-modal.tsx:215` — the handler value widened
from `number[]` to `number | readonly number[]`, so `([next]) =>` no longer
typechecks. Each call site now reads `Array.isArray(next) ? next[0] : next`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

A disabled slider now recedes part by part rather than under one blanket
`opacity-50` on the Control: the rail stays `bg-muted`, the indicator drops
the brand hue for `bg-muted-foreground/25`, and the thumb goes from a raised
24px white disc to a flat 12px grey one. Every part carries `data-disabled`
of its own, so none of this needs a group selector. It matters because the
sound cards draw one of these on every sound that is not in the mix, and a
green fill there would have claimed something was playing.

Also one fix landed later, when the three-column shell put
the Levels sliders permanently on screen: Base UI draws a real
`<input type="range">` inside each thumb, and that input is what a screen
reader lands on, so an `aria-label` written at the call site sat on the Root
and never reached it. The wrapper now carries it down through the thumb's
`getAriaLabel`, and a two-thumb slider numbers them so both do not read as the
same control. `seo-check` catches this one; it was silent before only because
no slider was rendered on a freshly loaded page.

## Verify by hand

Drag a sound's level to both ends and watch the fill follow. Keyboard: focus
a thumb, arrow keys should step it. The thumb should read as lifted off the
track, not drawn on it.
