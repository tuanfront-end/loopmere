import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#fdfcfa",
    description: "Ambient sound, mixed by you.",
    display: "standalone",
    icons: [
      ...[72, 128, 144, 152, 192, 256, 512].map((size) => ({
        purpose: "any" as const,
        sizes: `${size}x${size}`,
        src: `/assets/pwa/${size}.png`,
        type: "image/png",
      })),
      {
        // Square to the edges, for the launchers that crop to a shape of
        // their own — see `npm run icons`.
        purpose: "maskable",
        sizes: "512x512",
        src: "/assets/pwa/maskable-512.png",
        type: "image/png",
      },
    ],
    // What the install is known by, so moving `start_url` later does not make
    // it a second app.
    id: "/",
    name: "Loopmere",
    orientation: "any",
    scope: "/",
    short_name: "Loopmere",
    start_url: "/",
    theme_color: "#fdfcfa",
  };
}
