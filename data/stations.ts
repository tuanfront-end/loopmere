import type { Station } from "@/stores/radio";

/**
 * Lofi Girl's live streams get a new id each time one restarts, and the old
 * id stays a valid video that only says "This live stream recording is not
 * available". oEmbed answers 200 for both, so a dead station does not show
 * from here: open its watch page, and take the new id from the channel's
 * Live tab.
 */
export const STATIONS: Array<Station> = [
  { channel: "Lofi Girl", id: "rFZHOHl-L8A", title: "lofi hip hop radio" },
  { channel: "Lofi Girl", id: "4xDzrJKXOOY", title: "synthwave radio" },
  { channel: "Lofi Girl", id: "CwPCy1GLS38", title: "sad lofi radio" },
  { channel: "Lofi Girl", id: "S_MOd40zlYU", title: "dark ambient radio" },
  { channel: "Lofi Girl", id: "N0snMcR6aaA", title: "relaxing piano radio" },
];
