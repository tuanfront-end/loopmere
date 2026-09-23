# checkbox

2026-09-21 — golden pair via CLI (one conflict, hand-resolved). Placeholder icon resolved to this project's own glyph.

## Changed

`components/ui/checkbox.tsx` — base variant taken whole. The registry ships
`IconPlaceholder`, which resolves per icon library; this project's answer is
the one the placeholder itself names for hugeicons, `Tick02Icon`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

`checked="indeterminate"` is no longer a value — Base UI has a separate
`indeterminate` boolean. Nothing in this project used it.

## Verify by hand

Open the Checklist, tick and untick an item, and tab to one and hit Space.
The tick should be crisp at 14px, not a wireframe.
