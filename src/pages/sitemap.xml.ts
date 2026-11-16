/**
 * /sitemap.xml, generated at build time from src/data/sitemap.ts. The output is byte-identical to
 * the hand-written file it replaced (same header, groups, comments and blank lines), which
 * `seo:check` verifies against its baseline hash.
 */
import { SITE_ORIGIN, SITEMAP, type SitemapGroup } from '../data/sitemap';

const HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

function renderGroup(group: SitemapGroup): string {
  const urls = group.urls
    .map((url) => `<url>\n  <loc>${SITE_ORIGIN}${url.path}</loc>\n  <priority>${url.priority}</priority>\n</url>\n`)
    .join('');
  return `\n<!-- ${group.label} -->\n${urls}`;
}

export function renderSitemap(groups: readonly SitemapGroup[] = SITEMAP): string {
  return `${HEADER}${groups.map(renderGroup).join('')}\n</urlset>\n`;
}

export function GET(): Response {
  return new Response(renderSitemap(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
