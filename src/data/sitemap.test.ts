import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { renderSitemap } from '../pages/sitemap.xml';
import { SITEMAP } from './sitemap';

const paths = SITEMAP.flatMap((group) => group.urls.map((url) => url.path));

/** Source file of a clean URL: a page, or a data file of the PDF template. */
function pageExists(path: string): boolean {
  if (path === '/') return existsSync('src/pages/index.astro');
  const slug = path.slice(1);
  return existsSync(`src/pages/${slug}.astro`) || existsSync(`src/data/pdf-pages/${slug}.ts`);
}

describe('sitemap', () => {
  it('lists the 57 URLs of the hand-written file, once each', () => {
    expect(paths).toHaveLength(57);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('only lists pages that exist', () => {
    expect(paths.filter((path) => !pageExists(path))).toEqual([]);
  });

  it('renders one <url> per entry and closes the urlset', () => {
    const xml = renderSitemap();
    expect(xml.match(/<url>/g)).toHaveLength(57);
    expect(xml.endsWith('\n</urlset>\n')).toBe(true);
  });
});
