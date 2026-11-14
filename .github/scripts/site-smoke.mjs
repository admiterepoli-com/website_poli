#!/usr/bin/env node
// Smoke test for the built (or legacy) site. No dependencies.
// Usage: node .github/scripts/site-smoke.mjs [dir ...]   (default: dist . legacy public)
// Pages are read from the first directory that has an index.html. Links and
// assets may resolve in any of the directories, so the test also works in the
// intermediate states of the port (assets in public/, pages in legacy/).
// Checks: every expected page exists, has a <title>, every internal link and
// local asset resolves to a file, and every sitemap URL maps to a page.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const roots = (args.length ? args : ['dist', '.', 'legacy', 'public']).map((d) => resolve(d)).filter((d) => existsSync(d));
const site = roots.find((d) => existsSync(join(d, 'index.html')));
if (!site) {
  console.error('Site smoke test FAILED: no index.html found in ' + roots.join(', '));
  process.exit(1);
}
const ORIGIN = 'https://admiterepoli.com';
const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

const isFile = (p) => existsSync(p) && statSync(p).isFile();

/** Resolve a site path the way GitHub Pages does (clean URLs, index.html). */
function resolves(path) {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/' || clean === './') return true;
  return roots.some((root) => {
    const target = join(root, clean);
    return isFile(target) || isFile(`${target}.html`) || isFile(join(target, 'index.html'));
  });
}

const expected = readFileSync(join(here, 'expected-pages.txt'), 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);

const pages = readdirSync(site).filter((f) => f.endsWith('.html'));
const present = new Set(pages.map((f) => f.replace(/\.html$/, '')));

for (const slug of expected) {
  if (!present.has(slug)) fail(slug, 'expected page is missing (URL would 404)');
}

const known = new Set(
  readFileSync(join(here, 'known-broken-links.txt'), 'utf8')
    .split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#')),
);
let tolerated = 0;

const SKIP = /^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i;
const ATTR = /\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

for (const file of pages) {
  const raw = readFileSync(join(site, file), 'utf8');
  if (!/<title>\s*[^<\s][^<]*<\/title>/i.test(raw)) fail(file, 'missing or empty <title>');
  // Ignore scripts and comments so template strings are not treated as links.
  const html = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, '<script$1></script>');
  for (const m of html.matchAll(ATTR)) {
    const url = (m[1] ?? m[2] ?? '').trim();
    if (!url || SKIP.test(url)) continue;
    if (resolves(url.replace(/^\//, ''))) continue;
    if (known.has(`${file} ${url}`)) tolerated++;
    else fail(file, `broken link or asset: ${url}`);
  }
}

const sitemapPath = roots.map((r) => join(r, 'sitemap.xml')).find(isFile) ?? '';
if (!isFile(sitemapPath)) {
  fail('sitemap.xml', 'missing');
} else {
  const locs = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (locs.length === 0) fail('sitemap.xml', 'contains no URLs');
  for (const loc of locs) {
    if (!loc.startsWith(ORIGIN)) fail('sitemap.xml', `unexpected origin: ${loc}`);
    else if (!resolves(loc.slice(ORIGIN.length).replace(/^\//, ''))) fail('sitemap.xml', `URL has no page: ${loc}`);
  }
}

for (const f of ['robots.txt', 'CNAME']) {
  if (!roots.some((r) => isFile(join(r, f)))) fail(f, 'missing');
}

if (errors.length) {
  console.error(`Site smoke test FAILED (${errors.length} problem${errors.length > 1 ? 's' : ''}) in ${site}\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Site smoke test passed: ${pages.length} pages, ${expected.length} expected URLs present, links and sitemap OK, ${tolerated} known broken link(s) tolerated (${site}).`);
