import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP for browsers without it. The hero photograph is the
    // largest thing the page loads: 292 KB as WebP at 1920 wide, 149 as AVIF.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
