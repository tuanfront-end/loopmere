# separator

2026-09-21 — golden pair via CLI (`shadcn add --overwrite`). Pristine wrapper; the CLI delivered the base variant directly.

## Changed

`components/ui/separator.tsx` — untouched by this project, so
`shadcn add separator --overwrite` after the style flip was enough. Base UI's
separator root is callable, so `SeparatorPrimitive.Root` became
`SeparatorPrimitive`, and the `decorative` prop is gone.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

None.

## Verify by hand

Nothing here is interactive. A glance at any rule on the page covers it.
