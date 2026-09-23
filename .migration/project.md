# project

2026-09-21 — whole-project migration, `radix-nova` to `base-nova`.

## Dependency swap

`@base-ui/react` installed alongside `radix-ui` before any component moved;
`radix-ui` removed only after the last wrapper was migrated and the source
swept clean. `components.json` style flipped `radix-nova` to `base-nova`
at the start, which is what let `shadcn add` deliver base variants for the
three pristine wrappers.

## Wrappers

Eleven were on Radix. Three were pristine (separator, switch, scroll-area)
and came straight from the CLI. Eight were customized and went through
`git merge-file` with the radix golden as ancestor: button merged clean,
slider / tooltip / tabs / checkbox took one conflict each, dialog two, and
select and dropdown-menu were rebuilt from the base variant because their
merges produced four and five conflicts across a restructured component.

## App-code sweep

Five call-site breaks, all of them the kind the reference tables name:

- `asChild` to `render` — `toolbar.tsx`, `play-controls.tsx`, `tool-button.tsx`
- `TooltipProvider delayDuration` to `delay` — `app/layout.tsx`
- Slider handler value widened to `number | readonly number[]` — three files
- Select `onValueChange` widened to `string | null` — two files
- Select `Value` needs an `items` map to render labels — two files

The last one is the only break that compiles and still looks wrong: the
binaural trigger read `custom` instead of `Set it yourself` until `items`
was passed.

## Final build

`npm run build` compiles clean against a baseline that also compiled clean.
`tsc --noEmit`: 0 errors across 46 files.

The house-style checkers all pass: palette, type, controls, hover,
responsive. `controls-check` caught a real finding on the way — the base
variant puts the Select's padding on `SelectGroup`, and this project moves it
to the popup.

## Remaining

0 wrappers remain on Radix.
