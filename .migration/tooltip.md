# tooltip

2026-09-21 — golden pair via CLI (one conflict, hand-resolved). Took the base anatomy whole and removed the clamp again.

## Changed

`components/ui/tooltip.tsx` — `Content` became `Portal > Positioner > Popup`,
with the positioning props picked off `Positioner.Props`. The project's one
change is re-applied: `max-w-xs` comes off, because a tooltip here is one
short line and `type-check.py` reads a clamp plus `text-xs` as copy that
wraps.

`app/layout.tsx:35` — `TooltipProvider delayDuration` renamed to `delay`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

Base UI puts open and close delays on both Provider and Trigger, where Radix
had a single `delayDuration` on the Provider. The 200ms feel is preserved on
the Provider; per-trigger delays are available but unused.

## Verify by hand

Hover a favourite heart and a toolbar icon. The tooltip should appear after
roughly the same beat as before, and the arrow should sit against the
control on every side.
