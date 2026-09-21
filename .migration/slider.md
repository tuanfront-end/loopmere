# slider

2026-09-21 — golden pair via CLI (one conflict, hand-resolved). Anatomy changed; both of this project's changes were replayed onto it.

## Changed

`components/ui/slider.tsx` — Base UI wraps the track in
`SliderPrimitive.Control` and renames `Range` to `Indicator`. Took that
anatomy whole, then carried across the two project changes: track at
`h-1.5` (a 1px track reads as a hair under a 24px thumb) and the thumb at
`size-6 bg-card shadow-soft` with no border, which is the style's rule for a
raised control.

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

None.

## Verify by hand

Drag a sound's level to both ends and watch the fill follow. Keyboard: focus
a thumb, arrow keys should step it. The thumb should read as lifted off the
track, not drawn on it.
