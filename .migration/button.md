# button

2026-09-21 — golden pair via CLI (three-way merge, zero conflicts). Migrated to the real `@base-ui/react/button` primitive.

## Changed

`components/ui/button.tsx` — `radix-ui` Slot swapped for `ButtonPrimitive`.
The project's own scale survived the merge untouched: `rounded-full` on the
base class, `h-9/h-10/h-11` with `px-4/px-5/px-6`, `size-9/size-10/size-11`
for the icon variants, and no `xs` or `icon-xs`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

None.

## Verify by hand

Click a primary button, a ghost icon button and a disabled one. The pill
shape and the 40px default height should be unchanged from before.
