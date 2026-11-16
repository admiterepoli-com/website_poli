// Named with a leading underscore so src/pages/[slug].astro does not take it for a page.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import type { PdfPageData } from './_schema';

const files = import.meta.glob<{ default: PdfPageData }>(['./*.ts', '!./_*.ts'], { eager: true });
const pages = Object.entries(files).map(([path, mod]) => ({
  file: path.replace(/^\.\/|\.ts$/g, ''),
  page: mod.default,
}));

/** A relative internal URL (`./slug`, or `./slug.html` as a few legacy links are written) points at a page. */
function internalTargetExists(href: string): boolean {
  const slug = href.replace(/^\.\//, '').replace(/\.html$/, '');
  return existsSync(`src/pages/${slug}.astro`) || existsSync(`src/data/pdf-pages/${slug}.ts`);
}

/**
 * Links already broken on the live site, kept for parity (the smoke test reads the same list).
 * Format per line: `<page>.html <href>`.
 */
const KNOWN_BROKEN = new Set(
  readFileSync('.github/scripts/known-broken-links.txt', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#')),
);

describe('PDF page data files', () => {
  it('finds the template pages', () => {
    expect(pages.length).toBeGreaterThanOrEqual(40);
  });

  describe.each(pages)('$file', ({ file, page }) => {
    it('is named after its slug and has no page of its own', () => {
      expect(page.slug).toBe(file);
      expect(existsSync(`src/pages/${file}.astro`)).toBe(false);
    });

    it('either shows an existing PDF or a pending message', () => {
      if (page.pdf !== undefined) {
        expect(existsSync(`public/${page.pdf}`)).toBe(true);
        expect(page.errorMessage).toMatch(/^A apărut o eroare la încărcarea /);
      } else {
        expect(page.pendingMessage).toBeTruthy();
      }
    });

    it('links only to pages that exist', () => {
      const internal = [...page.usefulLinks, ...page.related]
        .map((link) => link.href)
        .filter((href) => href.startsWith('./'));
      const broken = internal.filter(
        (href) => !internalTargetExists(href) && !KNOWN_BROKEN.has(`${file}.html ${href}`),
      );
      expect(broken).toEqual([]);
    });
  });
});
