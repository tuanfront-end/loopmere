import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#fdfcfa",
    description: "Ambient sound, mixed by you.",
    display: "standalone",
    icons: [72, 128, 144, 152, 192, 256, 512].map((size) => ({
      purpose: "any",
      sizes: `${size}x${size}`,
      src: `/assets/pwa/${size}.png`,
      type: "image/png",
    })),
    name: "Loopmere",
    orientation: "any",
    scope: "/",
    short_name: "Loopmere",
    start_url: "/",
    theme_color: "#fdfcfa",
  };
}
