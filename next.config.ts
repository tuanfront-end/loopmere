import type { NextConfig } from "next";

/**
 * A short list that breaks nothing on the page. There is no
 * Content-Security-Policy yet: the theme script in the layout runs inline
 * before React, and a policy would need its hash kept in step with it, beside
 * allowances for the YouTube embed and the oEmbed lookup. Done half-way, a CSP
 * turns the radio or dark mode off without a word.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here is meant to be framed, and a framed mixer is one a page
  // around it can click through.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Features the app never asks for. Autoplay and fullscreen stay out of the
  // list, because the radio's embed uses them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { headers: SECURITY_HEADERS, source: "/:path*" },
      {
        // The loops never change under their name — the service worker
        // already keeps them forever — but Vercel serves `public/` with
        // `max-age=0`, so without it a browser asked again on every visit.
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/sounds/:path*",
      },
      {
        // A day, not forever: `npm run thiings:push` can replace an icon
        // under the same name.
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
        source: "/thiings/:path*",
      },
    ];
  },
  images: {
    // AVIF first, WebP for browsers without it. The hero photograph is the
    // largest thing the page loads: 292 KB as WebP at 1920 wide, 149 as AVIF.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
