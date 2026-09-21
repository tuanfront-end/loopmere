# tabs

2026-09-21 — golden pair via CLI (one conflict, hand-resolved). One class differed; the base variant won and the token was carried over.

## Changed

`components/ui/tabs.tsx` — took the base variant, which also adds
`aria-disabled:pointer-events-none aria-disabled:opacity-50`. Replaced its
`data-active:shadow-sm` with `shadow-soft`: the selected segment is a raised
control, and the stock scale puts a hard dark edge under it on surfaces this
close to white.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

Base UI tabs activate manually rather than on focus. Arrowing along the rail
moves focus without switching panel until Enter or Space. Flagged, not
patched — it is the more accessible default.

## Verify by hand

Open Pomodoro and click through Focus / Break / Long break. Then arrow along
them with the keyboard: focus should move without the timer resetting until
you press Enter.
