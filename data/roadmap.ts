/**
 * What Loopmere has shipped, what it builds next, and what it builds after
 * that. The Roadmap section on the home page renders this file and nothing
 * else, so moving an item is one edit here. CONTEXT.md § Roadmap holds the
 * three states and why the list lives in the repo rather than on GitHub.
 *
 * Shipped holds only what this port added. The first loops, the tools,
 * presets, sharing, the theme switch, the Undo on a cleared mix and Swell were
 * all Moodist's before they were Loopmere's, so none of them is here.
 */

/** In the order a reader meets them. */
export type RoadmapStatus = "shipped" | "next" | "later";

interface Item {
  blurb: string;
  id: string;
  /** Its issue on this repo, once it has one. The card links to it. */
  issue?: number;
  title: string;
}

/** Shipped carries the month it merged into `main`, as `YYYY-MM`. */
export interface ShippedItem extends Item {
  shipped: `${number}-${number}`;
  status: "shipped";
}

/** Next and Later carry no date: a date is a promise the roadmap does not make. */
export interface PlannedItem extends Item {
  status: "later" | "next";
}

export type RoadmapItem = PlannedItem | ShippedItem;

/**
 * The order written is the order drawn: Next is numbered in it, and Shipped
 * runs newest first.
 */
export const roadmap: Array<RoadmapItem> = [
  {
    blurb:
      "Close the Lofi panel and the station plays on, in a small player that stays while you change your mix.",
    id: "radio-plays-on",
    issue: 14,
    status: "next",
    title: "Lofi radio that keeps playing",
  },
  {
    blurb:
      "Clearing the mix and deleting a note come with Undo. Presets and checklist items get it too.",
    id: "undo-deletes",
    issue: 4,
    status: "next",
    title: "Undo for presets and to-dos",
  },
  {
    blurb:
      "There is no account to sync through, so you get a file of your presets that opens in any browser.",
    id: "preset-files",
    issue: 5,
    status: "next",
    title: "Presets you can carry",
  },
  {
    blurb:
      "Thunder, an owl or wind chimes can sound now and then instead of on a loop, each on its own timing.",
    id: "come-and-go",
    issue: 3,
    status: "later",
    title: "Sounds that come and go",
  },
  {
    blurb:
      "The three mixes on the first screen grow into a shelf of scenes, each one click to start.",
    id: "scenes",
    issue: 16,
    status: "later",
    title: "More ready-made scenes",
  },
  {
    blurb:
      "Add an audio file of your own. It stays in this browser, like every mix you build here.",
    id: "your-own-sounds",
    issue: 6,
    status: "later",
    title: "Your own sounds on a shelf",
  },
  {
    blurb:
      "Set each sound to the left or the right, so with headphones on the mix sounds like a place.",
    id: "balance",
    issue: 15,
    shipped: "2026-10",
    status: "shipped",
    title: "Place each sound left or right",
  },
  {
    blurb:
      "Type a name above the shelves and every sound it matches shows where it is and whether it plays.",
    id: "sound-search",
    shipped: "2026-10",
    status: "shipped",
    title: "Find a sound by name",
  },
  {
    blurb:
      "Paste a YouTube link into Lofi radio and it joins the stations, still there on your next visit.",
    id: "own-stations",
    shipped: "2026-10",
    status: "shipped",
    title: "Your own radio stations",
  },
  {
    blurb:
      "Drag the level on any card and that sound joins the mix, playing at the level you set.",
    id: "level-starts-sound",
    shipped: "2026-09",
    status: "shipped",
    title: "Start a sound from its level",
  },
  {
    blurb:
      "On a phone, a player sits over a tab bar along the bottom edge, one tap from anywhere.",
    id: "phone-player",
    shipped: "2026-09",
    status: "shipped",
    title: "Play and pause from anywhere",
  },
  {
    blurb:
      "Rainy study, Deep forest and Night train start from one click, and the same click stops them.",
    id: "starter-mixes",
    shipped: "2026-09",
    status: "shipped",
    title: "Three mixes on the first screen",
  },
  {
    blurb:
      "The shelf sits at the foot of the page from your first visit, so you find it before you need it.",
    id: "favourites-shelf",
    shipped: "2026-09",
    status: "shipped",
    title: "Favourites, always on the page",
  },
  {
    blurb:
      "Press Play them all in the Saved panel and the whole shelf starts, each loop where you left it.",
    id: "play-favourites",
    shipped: "2026-09",
    status: "shipped",
    title: "Every favourite at once",
  },
  {
    blurb:
      "Mute a loop from the mix panel and bring it back where it was, with no hunting for its card.",
    id: "pause-one-sound",
    shipped: "2026-09",
    status: "shipped",
    title: "Mute one sound, keep its level",
  },
  {
    blurb:
      "Take a sound out of the mix and put it back, and it returns at the level you set.",
    id: "levels-kept",
    shipped: "2026-09",
    status: "shipped",
    title: "Levels that survive a click",
  },
  {
    blurb:
      "A loaded preset turns into its own pause button, and the save box shows the name it is saved under.",
    id: "preset-playing",
    shipped: "2026-09",
    status: "shipped",
    title: "Presets that say they are playing",
  },
  {
    blurb:
      "A link sent after Build me a mix used to arrive empty. It carries the mix you hear.",
    id: "share-link",
    shipped: "2026-09",
    status: "shipped",
    title: "Share links that carry your mix",
  },
  {
    blurb:
      "Single-letter shortcuts can clash with a screen reader, so the Keyboard panel has a switch for them.",
    id: "shortcuts-off",
    shipped: "2026-09",
    status: "shipped",
    title: "Shortcuts you can switch off",
  },
  {
    blurb:
      "On a wide screen your mix and the tools keep a column beside the shelves while the page scrolls.",
    id: "mixer-in-view",
    shipped: "2026-09",
    status: "shipped",
    title: "The mixer stays in view",
  },
  {
    blurb:
      "On a phone both menus rise from the bottom edge and close with a swipe down.",
    id: "phone-sheets",
    shipped: "2026-09",
    status: "shipped",
    title: "Menus that fit a thumb",
  },
];

export const shipped = roadmap.filter(
  (item): item is ShippedItem => item.status === "shipped",
);
export const next = roadmap.filter((item) => item.status === "next");
export const later = roadmap.filter((item) => item.status === "later");

// Next is what gets built next, and nobody builds four things next. The build
// goes red here rather than the page quietly promising more than that.
if (next.length > 3) {
  throw new Error(
    `Next holds ${next.length} items and holds three at most. Move one to Later.`,
  );
}
