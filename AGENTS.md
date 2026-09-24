<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This repo is a port, not a template for sale

Loopmere (repo `loopmere`, formerly `moodist-next`) is an Astro → Next.js port of [remvze/moodist](https://github.com/remvze/moodist),
begun to study its architecture and now kept up for listeners. Nothing here
goes to a marketplace, so the packaging and sellability rules do not apply to
it.

**Shipping or adding a roadmap item?** Move it in `data/roadmap.ts` in the same
PR: to Shipped with the month it merges, and its issue closed by `Closes #N`.
`CONTEXT.md` § Roadmap defines the three states.

**Read `CONTEXT.md`** before changing ported code, before arguing with a red
gate, and before touching a `components/ui/` wrapper. It holds what the port
decided and why — the original's four architectural moves, the fixes the port
needed, the deliberate departures from Soft Neutral, and the open items.

`npm run check` is the set that is green today: a red one there is a
regression. Without the Soft Neutral skill installed it runs the build alone
and says so in a `gates:` line — report that run as a build, not as green
gates. `npm run check:all` adds five more; `CONTEXT.md` § Gate says which are
red and why.

The `components/ui/` wrappers are **Base UI**, not Radix. One migration report
per component lives in `.migration/`.
