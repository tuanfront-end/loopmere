/**
 * Resolves a public asset path. Next.js serves `public/` at the site root, so
 * the only job here is to normalise the leading slash.
 */
export function getAssetPath(relativePath: string): string {
  return `/${relativePath.replace(/^\/+/, '')}`;
}
