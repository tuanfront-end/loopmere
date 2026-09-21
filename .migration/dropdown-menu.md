# dropdown-menu

2026-09-21 — golden pair via CLI (five conflicts; base variant taken whole). Rebuilt from the base variant rather than merged, then restyled.

## Changed

`components/ui/dropdown-menu.tsx` — the merge produced five conflicts across
a heavily restructured component, so the base variant was taken whole and the
project's changes re-applied on top: `shadow-soft-lg` for the floating
surface, the submenu caret as a Heroicons `ChevronRightIcon`, and the two
check indicators as HugeIcons `Tick02Icon`. That split is the house rule —
every chevron is Heroicons, everything else is HugeIcons.

`components/moodist/toolbar.tsx:165` — `DropdownMenuTrigger asChild` became
`render={<Button …/>}`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` returns nothing.

## Left alone

`sonner.tsx` — not Radix, never was. `input.tsx` and `textarea.tsx` — native
elements with no primitive behind them, so there is nothing to migrate.

## Behavior changes

`CheckboxItem` and `RadioItem` no longer close the menu on click
(`closeOnClick` defaults false). This project has neither, so nothing
changes today; it is worth knowing before one is added.

## Verify by hand

Open the Tools menu, arrow down through the groups, and press Enter on a
panel. Type the first letter of an item and check typeahead jumps to it.
Confirm the separators still read as three groups.
