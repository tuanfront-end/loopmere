# select

2026-09-21 — golden pair via CLI (four conflicts; base variant taken whole). Rebuilt from the base variant; the value now needs its labels as data.

## Changed

`components/ui/select.tsx` — base variant taken whole. Re-applied:
`shadow-soft-lg` on the popup, `p-1` on the popup rather than on
`SelectGroup` (a flat list written without a group would otherwise sit flush
against the edge), and the placeholder icons resolved — `ChevronDownIcon` /
`ChevronUpIcon` from Heroicons for the carets, `Tick02Icon` from HugeIcons
for the item indicator.

`components/moodist/modals/tone-modal.tsx:155`,
`components/moodist/modals/breathing.tsx:124` — `Select.Value` renders the
raw value unless `Root` is given an `items` map, where Radix read the label
off the rendered `SelectItem`. Both call sites now pass `items`. Without it
the binaural trigger read `custom` instead of `Set it yourself`.

`tone-modal.tsx:157`, `breathing.tsx:129` — `onValueChange` widened to
`(value: string | null, details)`, so a bare `setState` no longer typechecks.
Both wrap the setter and ignore null, which is the cleared state neither list
can reach.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

None.

## Verify by hand

Open Binaural beat and Breathing. Each trigger should show a sentence, not an
id. Open a list, type a letter, and confirm typeahead moves the highlight.
Pick an item and confirm the trigger updates.
