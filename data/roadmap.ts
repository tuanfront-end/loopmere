/**
 * What Loopmere has shipped, what it builds next, and what it builds after
 * that. The Roadmap section on the home page renders this file and nothing
 * else, so moving an item is one edit here. CONTEXT.md § Roadmap holds the
 * three states and why the list lives in the repo rather than on GitHub.
 *
 * Shipped holds only what this port added. The loops, the tools, presets,
 * sharing, the theme switch and the Undo on a cleared mix were all Moodist's
 * before they were Loopmere's, so none of them is here.
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
      "Thunder rolls in every few minutes and birds call now and then, each on its own timing.",
    id: "come-and-go",
    issue: 3,
    status: "next",
    title: "Sounds that come and go",
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
      "Add an audio file of your own. It stays in this browser, like every mix you build here.",
    id: "your-own-sounds",
    issue: 6,
    status: "later",
    title: "Your own sounds on a shelf",
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
      "Press Play them all in the Saved panel and your whole shelf starts, each loop at the level you left it.",
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
