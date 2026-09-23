import type { Metadata } from 'next';

import { UPSTREAM_AUTHOR_URL, UPSTREAM_URL } from '@/constants/links';

/**
 * The address the site answers on. The canonical, the Open Graph url, the
 * sitemap and robots.txt all need an absolute one, and nothing in the request
 * can be trusted to supply it at build time. Set NEXT_PUBLIC_SITE_URL where it
 * is deployed; on Vercel the production domain is known without it; locally it
 * is the dev server.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3100'),
);

export const SITE_NAME = 'Loopmere';

export const SITE_TITLE = `${SITE_NAME} — ambient sound, mixed by you`;

export const SITE_DESCRIPTION =
  'Eighty-odd loops of rain, forest, cafe and static. Layer them, set the levels, and let the tab run.';

/**
 * The whole head for one route from two strings, so the title, the
 * description, the canonical and both cards cannot come apart. Every route
 * calls it; none writes `openGraph` by hand.
 *
 * `openGraph` stays out of the layout on purpose: Next replaces nested
 * metadata rather than merging it, so a card written there would label every
 * route with the home page's title. And the root route takes `title.absolute`,
 * because the layout's template reaches child segments and not the page that
 * shares its segment.
 */
export function pageMeta({
  description = SITE_DESCRIPTION,
  path,
  title,
}: {
  description?: string;
  path: string;
  title: string;
}): Metadata {
  const root = path === '/';
  // A card is read with nothing around it, so it carries the name a tab gets
  // from the template.
  const card = root ? title : `${title} — ${SITE_NAME}`;

  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      locale: 'en',
      siteName: SITE_NAME,
      title: card,
      type: 'website',
      url: path,
    },
    title: root ? { absolute: title } : title,
    twitter: { card: 'summary_large_image', description, title: card },
  };
}

/**
 * JSON-LD for the home page, holding only what the page proves: it is a web
 * app, it asks for nothing — no account, no payment — and it is a port of
 * Moodist by MAZE, which the rail and the footer already say.
 */
export function homeJsonLd() {
  const url = SITE_URL.href;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${url}#website`,
        '@type': 'WebSite',
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        name: SITE_NAME,
        url,
      },
      {
        '@id': `${url}#app`,
        '@type': 'WebApplication',
        applicationCategory: 'MultimediaApplication',
        browserRequirements: 'Requires JavaScript and HTML5 audio',
        description: SITE_DESCRIPTION,
        isAccessibleForFree: true,
        isBasedOn: {
          '@type': 'SoftwareSourceCode',
          author: { '@type': 'Person', name: 'MAZE', url: UPSTREAM_AUTHOR_URL },
          codeRepository: UPSTREAM_URL,
          license: 'https://opensource.org/license/mit',
          name: 'Moodist',
        },
        name: SITE_NAME,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        operatingSystem: 'Any',
        url,
      },
    ],
  };

  // A `</script>` inside any string would close the tag it is printed in.
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
