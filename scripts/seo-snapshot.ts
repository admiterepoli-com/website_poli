/**
 * SEO snapshot.
 *
 * Records everything about the site that a search engine reads from the static
 * HTML, so the port can be proven to leave it unchanged.
 *
 * Per page: <title>, meta description, canonical, meta robots, <html lang>,
 * h1/h2/h3 texts in order, internal and external link sets, images (src + alt),
 * and a hash + word count of the visible body text.
 * Site-wide: hashes of sitemap.xml and robots.txt, and of every file under
 * pdfs/ and images/.
 *
 * Limits: only static HTML is read. Text injected at runtime by JavaScript
 * (exam questions, video cards, auth modal) is NOT part of the snapshot; it is
 * covered by the visual and end-to-end checks instead.
 *
 * The committed seo-baseline.json was generated once from the legacy site:
 *   node scripts/seo-snapshot.ts legacy public > seo-baseline.json
 * Do not regenerate it to make a failing check pass. A failing check means the
 * port changed something Google can see.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

export interface PageSnapshot {
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  headings: string[];
  internalLinks: string[];
  externalLinks: string[];
  images: string[];
  textWords: number;
  textHash: string;
}

export interface SiteSnapshot {
  pages: Record<string, PageSnapshot>;
  files: Record<string, string>;
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const ASSET_DIRS = ['pdfs', 'images'];
const ROOT_FILES = ['sitemap.xml', 'robots.txt', 'CNAME'];

const sha = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex').slice(0, 16);
const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();
const normaliseHref = (href: string): string =>
  href
    .trim()
    .replace(/^\.\//, '')
    .replace(/^\/(?!\/)/, '') || '/';
const unique = (values: string[]): string[] => [...new Set(values)].sort();

export function snapshotPage(html: string): PageSnapshot {
  const $ = load(html, { scriptingEnabled: false });
  const attr = (selector: string, name: string): string | null => {
    const value = $(selector).first().attr(name);
    return value === undefined ? null : squash(value);
  };

  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') ?? '').trim();
    if (href === '' || href.startsWith('#')) return;
    if (EXTERNAL.test(href)) externalLinks.push(href);
    else internalLinks.push(normaliseHref(href));
  });

  const headings = $('h1, h2, h3')
    .toArray()
    .map((el) => `${el.tagName.toLowerCase()}: ${squash($(el).text())}`);

  const images = $('img')
    .toArray()
    .map((el) => `${normaliseHref($(el).attr('src') ?? '')} | ${squash($(el).attr('alt') ?? '')}`);

  const titleEl = $('head > title').first();
  const body = $('body').clone();
  body.find('script, style, template').remove();
  const text = squash(body.text());

  return {
    title: titleEl.length ? squash(titleEl.text()) : null,
    description: attr('meta[name="description"]', 'content'),
    canonical: attr('link[rel="canonical"]', 'href'),
    robots: attr('meta[name="robots"]', 'content'),
    lang: attr('html', 'lang'),
    headings,
    internalLinks: unique(internalLinks),
    externalLinks: unique(externalLinks),
    images,
    textWords: text === '' ? 0 : text.split(' ').length,
    textHash: sha(text),
  };
}

function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else out.push(relative(base, full));
  }
  return out;
}

/** Snapshot one or more directories as if they were merged into one site root. */
export function snapshotSite(dirs: string[]): SiteSnapshot {
  const pages: Record<string, PageSnapshot> = {};
  const files: Record<string, string> = {};

  for (const dir of dirs.map((d) => resolve(d))) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (name.endsWith('.html') && statSync(full).isFile()) {
        pages[name.replace(/\.html$/, '')] = snapshotPage(readFileSync(full, 'utf8'));
      }
    }
    for (const name of ROOT_FILES) {
      const full = join(dir, name);
      if (existsSync(full)) files[name] = sha(readFileSync(full));
    }
    for (const assetDir of ASSET_DIRS) {
      const full = join(dir, assetDir);
      if (!existsSync(full)) continue;
      for (const file of walk(full)) {
        if (file.endsWith('.DS_Store')) continue;
        files[`${assetDir}/${file}`] = sha(readFileSync(join(full, file)));
      }
    }
  }

  const sortKeys = <T>(record: Record<string, T>): Record<string, T> =>
    Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
  return { pages: sortKeys(pages), files: sortKeys(files) };
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    console.error('usage: node scripts/seo-snapshot.ts <dir> [dir ...]');
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(snapshotSite(dirs), null, 1) + '\n');
}
