import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Everything is open — one route, and nothing on it behind an account. The
 * sitemap, this file and a page's own `robots` field are one list; the day a
 * route sets `robots: { index: false }`, it leaves the sitemap and is
 * disallowed here in the same change.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
