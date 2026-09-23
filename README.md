# Loopmere

![Loopmere — ambient sound, mixed by you](app/opengraph-image.jpg)

Ambient sound, mixed by you. Eighty-four loops of rain, forest, cafe and static
that you layer, level and leave running in a tab. There is nothing to sign up
for, and the mix you build stays in your browser.

> **Loopmere is a Next.js port of [Moodist](https://github.com/remvze/moodist)
> by [MAZE](https://github.com/remvze), used under the MIT licence.** The
> sounds, the tools and the architecture are Moodist's. This repository
> rebuilds it on Next.js to study how it works, and gives it a face of its own.
> For the original — maintained, self-hostable, and the reason this exists —
> go to [remvze/moodist](https://github.com/remvze/moodist) or
> [moodist.mvze.net](https://moodist.mvze.net).

## What it does

- 84 loops on eight shelves, each with its own level, plus a shelf of
  favourites you fill yourself
- Presets that remember which loops were on and how loud, and mixes you can
  send as a link
- Tools that run alongside: sleep timer, countdown, Pomodoro, notepad,
  checklist, breathing, binaural beats, isochronic tones and a lofi radio
- Installable as an app, with an offline cache, in light and dark

## What changed in the port

- **Stack:** Astro → Next.js 16 (App Router) with React 19, Base UI, Tailwind
  CSS 4 and zustand.
- **Identity:** a new name and mark. Moodist's name and logo belong to the
  original project, so they appear here only where the original is credited.
- **Fixes found on the way:** lists that doubled on every development reload,
  settings that reset themselves, a share link that sent an empty mix, and
  more. Each one, with its cause, is in [`CONTEXT.md`](CONTEXT.md).

## Run it

```bash
npm install
npm run dev
```

It serves on [http://localhost:3100](http://localhost:3100) — 3100 rather than
3000 so it can run beside the original, which uses 4321.

```bash
npm run check      # build and the gates that are green today; red here is a regression
npm run check:all  # five more gates; CONTEXT.md § Gate says which are red and why
npm run icons      # re-render the favicon, app icons and media artwork from app/icon.svg
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed address so the canonical URL, the
share cards and the sitemap point at it. On Vercel the production domain is
picked up without it.

## Read first

| File | What it holds |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | The original's architecture, what the port had to fix, and every deliberate decision since (written in Vietnamese) |
| [`.migration/`](.migration/) | One report per component moved from Radix to Base UI |

## Sound icons

`public/thiings/` is **not in this repository.** thiings.co licenses those
images for personal use only, so the 92 PNGs are not redistributed. The app
builds and runs without them: each icon sits in a fixed-size box with
`alt=""`, so a missing file is an empty space rather than a broken image. To
use them, download the files named in
[`data/sound-thiings.ts`](data/sound-thiings.ts) into `public/thiings/`.

## Credits and licence

- **Original:** [Moodist](https://github.com/remvze/moodist) by
  [MAZE](https://github.com/remvze) — the product, its sounds, its tools and
  its architecture.
- **Code:** MIT — see [`LICENSE`](LICENSE), Copyright (c) 2023 MAZE.
- **Sounds:** `public/sounds/` (117 MB, committed) under the Pixabay Content
  License and CC0, as in the original.
- **Port:** built by Boolii Studio.

Because `public/sounds/` is committed, a clone is about 125 MB. It runs with
no further download.
