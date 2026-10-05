/**
 * Mixes made here and shipped with the page: a name, the place in a line, and
 * the loops at their levels. The first three are the hero's "Three made
 * earlier"; the Scenes section shows them all.
 *
 * Every id is a sound in `data/sounds`, and `swell` lists the ones that rise
 * and fall — a scene uses it on the beds that would otherwise hold still.
 */
export interface Scene {
  blurb: string;
  id: string;
  sounds: Record<string, number>;
  swell?: Array<string>;
  title: string;
}

export const SCENES: Array<Scene> = [
  {
    blurb: "Rain on the glass, keys under your hands.",
    id: "rainy-study",
    sounds: { cafe: 0.25, keyboard: 0.3, "light-rain": 0.6 },
    title: "Rainy study",
  },
  {
    blurb: "A fire by the river, trees talking overhead.",
    id: "deep-forest",
    sounds: { campfire: 0.3, river: 0.4, "wind-in-trees": 0.5 },
    title: "Deep forest",
  },
  {
    blurb: "A carriage after dark, rain against the window.",
    id: "night-train",
    sounds: { clock: 0.2, "inside-a-train": 0.55, "rain-on-window": 0.4 },
    title: "Night train",
  },
  {
    blurb: "Boats knocking while the gulls wake up.",
    id: "harbour-at-dawn",
    sounds: { sailboat: 0.35, seagulls: 0.3, waves: 0.5 },
    swell: ["waves"],
    title: "Harbour at dawn",
  },
  {
    blurb: "Canvas holding out against rain and far thunder.",
    id: "tent-in-a-storm",
    sounds: { "howling-wind": 0.3, "rain-on-tent": 0.6, thunder: 0.45 },
    swell: ["howling-wind"],
    title: "Tent in a storm",
  },
  {
    blurb: "A tall, quiet room, pages turning.",
    id: "reading-room",
    sounds: { "ceiling-fan": 0.2, clock: 0.15, library: 0.45, paper: 0.2 },
    title: "Reading room",
  },
  {
    blurb: "Two machines going and nowhere to be.",
    id: "sunday-laundry",
    sounds: {
      dryer: 0.25,
      "laundry-room": 0.4,
      "rain-on-window": 0.3,
      "washing-machine": 0.35,
    },
    title: "Sunday laundry",
  },
  {
    blurb: "A bowl struck once, wind over the roof.",
    id: "mountain-temple",
    sounds: { "singing-bowl": 0.25, temple: 0.4, wind: 0.3, "wind-chimes": 0.2 },
    swell: ["wind"],
    title: "Mountain temple",
  },
  {
    blurb: "The last few tables, a record turning.",
    id: "cafe-at-closing",
    sounds: { cafe: 0.35, "rain-on-window": 0.3, "vinyl-effect": 0.3 },
    title: "Café at closing",
  },
  {
    blurb: "Deep water and a whale somewhere far off.",
    id: "under-the-sea",
    sounds: { bubbles: 0.25, underwater: 0.5, whale: 0.35 },
    swell: ["underwater"],
    title: "Under the sea",
  },
  {
    blurb: "Crickets, frogs, an owl over a sleeping village.",
    id: "summer-night",
    sounds: { crickets: 0.45, frog: 0.3, "night-village": 0.3, owl: 0.2 },
    title: "Summer night",
  },
  {
    blurb: "Traffic and rain from five floors up.",
    id: "city-below",
    sounds: { "busy-street": 0.25, "rain-on-window": 0.45, road: 0.3 },
    title: "City below",
  },
];
