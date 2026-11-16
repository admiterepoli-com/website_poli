/**
 * Final SEO parity report (#88): compares the pre-port site (rebuilt from git at the visual
 * BASE_COMMIT) with the current dist/, beyond what `seo:check` covers, and writes the result to
 * docs-port/seo-parity-report.md.
 *
 *   npm run build && node scripts/seo-report.ts
 *
 * Exit code 1 when an SEO-relevant difference is found (URL set, root files, assets, title,
 * description, robots, canonical, lang, icon, rendered text). Differences in <head> tags that
 * search engines do not index (scripts, stylesheets, preconnects) are listed, not failed.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, relative, resolve } from 'node:path';
import { load } from 'cheerio';
import { chromium, type Browser } from 'playwright';
import { BASE_COMMIT, FIXED_TIME } from './visual.config.ts';

const ROOT = resolve('.');
const DIST = join(ROOT, 'dist');
const REFERENCE = join(ROOT, '.visual', `reference-${BASE_COMMIT}`);
const REPORT = join(ROOT, 'docs-port', 'seo-parity-report.md');

/** Requests never needed to render the text: analytics and Firebase (both versions stay signed out). */
const BLOCKED = [
  /googletagmanager\.com$/,
  /google-analytics\.com$/,
  /googleapis\.com$/,
  /script\.google\.com$/,
];

const sha = (data: Buffer | string): string => createHash('sha256').update(data).digest('hex');
const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();

function prepareReference(): void {
  if (existsSync(join(REFERENCE, 'index.html'))) return;
  mkdirSync(REFERENCE, { recursive: true });
  for (const dir of ['legacy', 'public']) {
    const tar = execFileSync('git', ['archive', BASE_COMMIT, dir], { maxBuffer: 1024 ** 3 });
    execFileSync('tar', ['-x', '--strip-components=1', '-C', REFERENCE], { input: tar });
  }
}

function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else out.push(relative(base, full));
  }
  return out.sort();
}

const htmlPages = (dir: string): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.html'))
    .sort();

/* ── <head> ─────────────────────────────────────────────────── */

/** Head facts a search engine uses; any difference fails the report. */
interface HeadSeo {
  title: string | null;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  lang: string | null;
  charset: string | null;
  viewport: string | null;
  icon: string | null;
}

function headOf(html: string): { seo: HeadSeo; tags: string[] } {
  const $ = load(html, { scriptingEnabled: false });
  const attr = (selector: string, name: string): string | null => {
    const value = $(selector).first().attr(name);
    return value === undefined ? null : squash(value);
  };
  const title = $('head > title').first();
  const seo: HeadSeo = {
    title: title.length ? squash(title.text()) : null,
    description: attr('meta[name="description"]', 'content'),
    robots: attr('meta[name="robots"]', 'content'),
    canonical: attr('link[rel="canonical"]', 'href'),
    lang: attr('html', 'lang'),
    charset: $('meta[charset]').first().attr('charset')?.toLowerCase() ?? null,
    viewport: attr('meta[name="viewport"]', 'content'),
    icon: attr('link[rel="icon"]', 'href')?.replace(/^\.\//, '') ?? null,
  };
  // Every head element, in order, reduced to what identifies it (scripts by src or "inline").
  const tags = $('head')
    .children()
    .toArray()
    .map((el) => {
      const node = $(el);
      const name = el.tagName.toLowerCase();
      if (name === 'script') return `script ${node.attr('src') ?? 'inline'}`;
      if (name === 'style') return 'style inline';
      if (name === 'link') return `link ${node.attr('rel') ?? ''} ${node.attr('href') ?? ''}`.trim();
      if (name === 'meta') {
        const key =
          node.attr('charset') !== undefined
            ? 'charset'
            : (node.attr('name') ?? node.attr('property') ?? '?');
        return `meta ${key}`;
      }
      return name;
    });
  return { seo, tags };
}

/** Head tags that do not reach the index: their order or form may change with the build. */
function isNonIndexed(tag: string): boolean {
  return /^(script|style|link (stylesheet|preconnect|preload|modulepreload))\b/.test(tag);
}

/* ── Rendered text ──────────────────────────────────────────── */

function serve(dir: string): Promise<Server> {
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
  };
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
    let file = join(dir, pathname);
    if (pathname.endsWith('/')) file = join(file, 'index.html');
    else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
    if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

/** Text of the page after its scripts ran, or where it redirected to (e.g. `/profil` signed out). */
async function renderedText(browser: Browser, url: string): Promise<string> {
  const context = await browser.newContext({ locale: 'ro-RO', timezoneId: 'Europe/Bucharest' });
  await context.route(
    (u) => BLOCKED.some((pattern) => pattern.test(u.hostname)),
    (route) => route.abort(),
  );
  const page = await context.newPage();
  await page.clock.install({ time: new Date(FIXED_TIME) });
  await page.goto(url, { waitUntil: 'load' });
  await page.clock.runFor(8000);
  await page.waitForTimeout(300);
  const landed = new URL(page.url()).pathname;
  const asked = new URL(url).pathname;
  if (landed !== asked) {
    // The page sent the visitor elsewhere; what matters is where, not the half-loaded text there.
    await context.close();
    return `redirects to ${landed}`;
  }
  const text = await page.evaluate(() => document.body.innerText);
  await context.close();
  return squash(text);
}

/* ── Report ─────────────────────────────────────────────────── */

async function main(): Promise<void> {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('seo-report: run "npm run build" first.');
    process.exit(2);
  }
  prepareReference();
  const failures: string[] = [];
  const notes: string[] = [];
  const lines: string[] = [];

  // 1. URL set
  const refPages = htmlPages(REFERENCE);
  const distPages = htmlPages(DIST);
  const missing = refPages.filter((p) => !distPages.includes(p));
  const added = distPages.filter((p) => !refPages.includes(p));
  if (missing.length || added.length)
    failures.push(`URL set differs: missing ${missing.join(', ') || '—'}; added ${added.join(', ') || '—'}`);

  // 2. Root files
  const rootRows = ['sitemap.xml', 'robots.txt', 'CNAME', '.nojekyll'].map((name) => {
    const a = join(REFERENCE, name);
    const b = join(DIST, name);
    const same = existsSync(a) && existsSync(b) && sha(readFileSync(a)) === sha(readFileSync(b));
    if (!same) failures.push(`${name} is not byte-identical`);
    return `| \`${name}\` | ${same ? 'identical' : '**differs**'} |`;
  });

  // 3. Assets
  const assetDirs = ['pdfs', 'images'];
  let assetCount = 0;
  const assetProblems: string[] = [];
  for (const dir of assetDirs) {
    for (const file of walk(join(REFERENCE, dir))) {
      if (file.endsWith('.DS_Store')) continue;
      assetCount += 1;
      const b = join(DIST, dir, file);
      if (!existsSync(b)) assetProblems.push(`${dir}/${file} missing`);
      else if (sha(readFileSync(join(REFERENCE, dir, file))) !== sha(readFileSync(b)))
        assetProblems.push(`${dir}/${file} changed`);
    }
  }
  failures.push(...assetProblems);

  // 4. Every image / PDF URL referenced by a built page resolves.
  const brokenRefs: string[] = [];
  for (const page of distPages) {
    const $ = load(readFileSync(join(DIST, page), 'utf8'));
    const refs = [
      ...$('img[src]')
        .toArray()
        .map((el) => $(el).attr('src') ?? ''),
      ...$('[data-pdf-src]')
        .toArray()
        .map((el) => $(el).attr('data-pdf-src') ?? ''),
    ].filter((src) => src !== '' && !/^(?:[a-z]+:|\/\/|data:)/i.test(src));
    for (const src of refs) {
      const path = src.replace(/^\.?\//, '');
      if (!existsSync(join(DIST, path))) brokenRefs.push(`${page}: ${src}`);
    }
  }
  failures.push(...brokenRefs.map((r) => `missing asset ${r}`));

  // 5. Head
  const headRows: string[] = [];
  const nonIndexedDiffs = new Map<string, number>();
  let headSeoEqual = 0;
  let headOrderEqual = 0;
  for (const page of refPages.filter((p) => distPages.includes(p))) {
    const a = headOf(readFileSync(join(REFERENCE, page), 'utf8'));
    const b = headOf(readFileSync(join(DIST, page), 'utf8'));
    const seoDiff = (Object.keys(a.seo) as (keyof HeadSeo)[]).filter((k) => a.seo[k] !== b.seo[k]);
    if (seoDiff.length === 0) headSeoEqual += 1;
    for (const key of seoDiff) {
      failures.push(`${page}: <head> ${key} ${JSON.stringify(a.seo[key])} → ${JSON.stringify(b.seo[key])}`);
    }
    const indexedA = a.tags.filter((t) => !isNonIndexed(t));
    const indexedB = b.tags.filter((t) => !isNonIndexed(t));
    if (indexedA.join('\n') === indexedB.join('\n')) headOrderEqual += 1;
    else notes.push(`${page}: order of indexed head tags: ${indexedA.join(', ')} → ${indexedB.join(', ')}`);
    const setA = new Set(a.tags.filter(isNonIndexed));
    const setB = new Set(b.tags.filter(isNonIndexed));
    for (const t of setA)
      if (!setB.has(t)) nonIndexedDiffs.set(`− ${t}`, (nonIndexedDiffs.get(`− ${t}`) ?? 0) + 1);
    for (const t of setB)
      if (!setA.has(t))
        nonIndexedDiffs.set(
          `+ ${t.replace(/\.[A-Za-z0-9_-]{8}\.(css|js)$/, '.[hash].$1')}`,
          (nonIndexedDiffs.get(`+ ${t.replace(/\.[A-Za-z0-9_-]{8}\.(css|js)$/, '.[hash].$1')}`) ?? 0) + 1,
        );
    headRows.push(
      `| \`${page.replace(/\.html$/, '')}\` | ${b.seo.title ?? '—'} | ${b.seo.robots ?? '—'} | ${b.seo.canonical ?? '—'} | ${seoDiff.length ? '**' + seoDiff.join(', ') + '**' : 'equal'} |`,
    );
  }

  // 6. Rendered text with JavaScript
  const [refServer, distServer] = await Promise.all([serve(REFERENCE), serve(DIST)]);
  const port = (s: Server): number => (s.address() as AddressInfo).port;
  const browser = await chromium.launch();
  const textRows: string[] = [];
  let textEqual = 0;
  try {
    for (const page of refPages.filter((p) => distPages.includes(p))) {
      const path = page === 'index.html' ? '' : page.replace(/\.html$/, '');
      const [a, b] = await Promise.all([
        renderedText(browser, `http://127.0.0.1:${port(refServer)}/${path}`),
        renderedText(browser, `http://127.0.0.1:${port(distServer)}/${path}`),
      ]);
      if (a === b) textEqual += 1;
      else {
        let i = 0;
        while (i < a.length && a[i] === b[i]) i += 1;
        const ctx = (s: string): string => s.slice(Math.max(0, i - 60), i + 80).replace(/\|/g, '\\|');
        failures.push(`${page}: rendered text differs`);
        textRows.push(`| \`${page}\` | …${ctx(a)}… | …${ctx(b)}… |`);
      }
    }
  } finally {
    await browser.close();
    refServer.close();
    distServer.close();
  }

  // Write the report.
  const date = new Date().toISOString().slice(0, 10);
  lines.push(
    '# SEO parity report: legacy site vs Astro port',
    '',
    `Generated by \`node scripts/seo-report.ts\` on ${date}. Reference: the pre-port site rebuilt from git at \`${BASE_COMMIT}\` (\`legacy/\` + \`public/\`); port: \`dist/\` of the current build.`,
    '',
    `**Result: ${failures.length === 0 ? 'no SEO-relevant difference found' : `${failures.length} SEO-relevant difference(s)`}.**`,
    '',
    '## Summary',
    '',
    '| Check | Result |',
    '| --- | --- |',
    `| URL set (HTML files, incl. \`404.html\`) | ${refPages.length} legacy, ${distPages.length} port, ${missing.length + added.length === 0 ? 'identical' : '**differs**'} |`,
    `| \`sitemap.xml\`, \`robots.txt\`, \`CNAME\`, \`.nojekyll\` | ${rootRows.every((r) => r.includes('identical')) ? 'byte-identical' : '**differs**'} |`,
    `| PDFs and images (${assetCount} files) | ${assetProblems.length === 0 ? 'byte-identical' : `**${assetProblems.length} differ**`} |`,
    `| Image / PDF URLs referenced by pages resolve | ${brokenRefs.length === 0 ? 'all' : `**${brokenRefs.length} missing**`} |`,
    `| \`<head>\`: title, description, robots (noindex), canonical, lang, charset, viewport, icon | equal on ${headSeoEqual} / ${refPages.length} pages |`,
    `| \`<head>\`: order of indexed tags (title, meta, canonical, icon) | same order on ${headOrderEqual} / ${refPages.length} pages |`,
    `| Rendered text with JavaScript enabled (headless Chromium, signed out, clock at ${FIXED_TIME}) | equal on ${textEqual} / ${refPages.length} pages |`,
    '',
  );
  if (failures.length) lines.push('## SEO-relevant differences', '', ...failures.map((f) => `- ${f}`), '');
  if (textRows.length)
    lines.push('### Rendered text', '', '| Page | Legacy | Port |', '| --- | --- | --- |', ...textRows, '');
  lines.push('## Root files', '', '| File | Result |', '| --- | --- |', ...rootRows, '');
  lines.push(
    '## `<head>` tags search engines do not index',
    '',
    'Scripts, stylesheets and preconnects change form with the build (bundled CSS, the auth module, KaTeX self-hosted, the cookie consent script inlined). They are not indexed; listed for completeness. Count = pages.',
    '',
    '| Change | Pages |',
    '| --- | --- |',
    ...[...nonIndexedDiffs.entries()].sort().map(([tag, n]) => `| \`${tag}\` | ${n} |`),
    '',
  );
  if (notes.length) lines.push('### Order of indexed head tags', '', ...notes.map((n) => `- ${n}`), '');
  lines.push(
    '## Per page',
    '',
    '| Page | Title | Robots | Canonical | SEO head fields |',
    '| --- | --- | --- | --- | --- |',
    ...headRows,
    '',
  );
  mkdirSync(join(ROOT, 'docs-port'), { recursive: true });
  writeFileSync(REPORT, lines.join('\n'));
  console.log(
    `seo-report: ${failures.length} SEO-relevant difference(s); report written to ${relative(ROOT, REPORT)}`,
  );
  if (failures.length) process.exit(1);
}

await main();
