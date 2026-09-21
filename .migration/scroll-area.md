# scroll-area

2026-09-21 — golden pair via CLI (`shadcn add --overwrite`). Pristine wrapper; the CLI delivered the base variant directly.

## Changed

`components/ui/scroll-area.tsx` — untouched by this project. The `type` prop
(`always` / `scroll` / …) is dropped in Base UI; nothing here passed one.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

None.

## Verify by hand

Not currently mounted anywhere in this project. If one is added, check the
thumb appears on overflow and drags.
