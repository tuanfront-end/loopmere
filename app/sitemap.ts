import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * No `lastModified`: nothing here carries a date of its own, and stamping the
 * build time on every entry tells a crawler the whole site changed on each
 * deploy — a sitemap caught in that has all its dates ignored.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL.href }];
}
