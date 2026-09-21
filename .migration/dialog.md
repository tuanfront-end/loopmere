# dialog

2026-09-21 — golden pair via CLI (two conflicts, hand-resolved). Base variant taken whole; four project changes replayed onto it.

## Changed

`components/ui/dialog.tsx` — `Overlay` became `Backdrop`, `Content` became
`Popup`. Replayed: `shadow-soft-lg` in place of the generated ring (the token
carries its own hairline, so a separate ring is two cues), `p-6` and
`rounded-lg` for airy density and container radius, `no-scrollbar` with
`max-h-[calc(100dvh-4rem)]` so a long panel scrolls without painting a
scrollbar on the panel's own corner, `rounded-full` on the close control, and
`leading-none` removed — Tailwind pairs a leading with every named size.

The registry's `@/registry/base-nova/ui/button` import and its
`IconPlaceholder` are monorepo scaffolding; both were rewritten to this
project's paths and to `Cancel01Icon`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

`onOpenAutoFocus` is gone; Base UI takes an element or ref via `initialFocus`
instead of an event handler. Nothing in this project used it — the Notepad
focuses its textarea itself.

## Verify by hand

Open any panel and press Escape. Open the Notepad and check the caret lands
in the textarea. Tab through a panel and confirm focus stays inside it, then
close and confirm focus returns to the toolbar button.
