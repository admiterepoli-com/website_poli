/**
 * Visual regression: renders a page from the legacy reference site and from the
 * current build, and compares full-page screenshots at desktop and mobile width.
 *
 *   npm run build
 *   npm run visual -- cti-vs-is          one page (slug without .html)
 *   npm run visual -- index contact      several pages
 *   npm run visual -- --all              every page in dist/
 *   npm run visual -- --keep <slug>      also save the screenshots when the page passes
 *
 * Diff images are written to .visual/out/ (gitignored). Exit code 1 if any page
 * differs by more than MAX_DIFF_RATIO.
 *
 * Determinism: time is frozen at FIXED_TIME, animations and transitions are
 * disabled, analytics is blocked, and PDF canvases are hidden (their layout box
 * is still compared, their pixels are not).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, resolve } from 'node:path';
import pixelmatch from 'pixelmatch';
import { chromium, type Browser } from 'playwright';
import { PNG } from 'pngjs';
import {
  BASE_COMMIT,
  BLOCKED_HOSTS,
  FIXED_TIME,
  MAX_DIFF_RATIO,
  PIXEL_THRESHOLD,
  SETTLE_MS,
  VIEWPORTS,
} from './visual.config.ts';

const ROOT = resolve('.');
const WORK = join(ROOT, '.visual');
const REFERENCE = join(WORK, `reference-${BASE_COMMIT}`);
const OUT = join(WORK, 'out');
const DIST = join(ROOT, 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

/** Rebuild the old site from git: legacy/ and public/ of BASE_COMMIT merged into one root. */
function prepareReference(): void {
  if (existsSync(join(REFERENCE, 'index.html'))) return;
  mkdirSync(REFERENCE, { recursive: true });
  for (const dir of ['legacy', 'public']) {
    const tar = execFileSync('git', ['archive', BASE_COMMIT, dir], { maxBuffer: 1024 ** 3 });
    execFileSync('tar', ['-x', '--strip-components=1', '-C', REFERENCE], { input: tar });
  }
}

/** Static file server with GitHub Pages style clean URLs. */
function serve(dir: string): Promise<Server> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
    const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const candidates = [join(dir, rel), join(dir, `${rel}.html`)];
    const file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    if (file === undefined || rel.includes('..')) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

const port = (server: Server): number => (server.address() as AddressInfo).port;

async function capture(browser: Browser, url: string, width: number, height: number): Promise<PNG> {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'ro-RO',
    timezoneId: 'Europe/Bucharest',
  });
  await context.route(
    (requestUrl) => BLOCKED_HOSTS.includes(requestUrl.hostname),
    (route) => route.abort(),
  );
  const page = await context.newPage();
  await page.clock.install({ time: new Date(FIXED_TIME) });
  await page.goto(url, { waitUntil: 'load' });
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; scroll-behavior: auto !important; }
      #pdfViewer canvas { visibility: hidden !important; }`,
  });
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.clock.runFor(SETTLE_MS);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForLoadState('networkidle').catch(() => undefined);
  const buffer = await page.screenshot({ fullPage: true, animations: 'disabled' });
  await context.close();
  return PNG.sync.read(buffer);
}

interface Result {
  slug: string;
  viewport: string;
  ok: boolean;
  detail: string;
}

function compare(slug: string, viewport: string, before: PNG, after: PNG, keep: boolean): Result {
  const base = join(OUT, `${slug}.${viewport}`);
  if (before.width !== after.width || before.height !== after.height) {
    writeFileSync(`${base}.legacy.png`, PNG.sync.write(before));
    writeFileSync(`${base}.port.png`, PNG.sync.write(after));
    return {
      slug,
      viewport,
      ok: false,
      detail: `page size changed: ${before.width}x${before.height} before, ${after.width}x${after.height} now`,
    };
  }
  const diff = new PNG({ width: before.width, height: before.height });
  const changed = pixelmatch(before.data, after.data, diff.data, before.width, before.height, {
    threshold: PIXEL_THRESHOLD,
  });
  const ratio = changed / (before.width * before.height);
  const ok = ratio <= MAX_DIFF_RATIO;
  if (!ok || keep) {
    writeFileSync(`${base}.legacy.png`, PNG.sync.write(before));
    writeFileSync(`${base}.port.png`, PNG.sync.write(after));
    writeFileSync(`${base}.diff.png`, PNG.sync.write(diff));
  }
  return { slug, viewport, ok, detail: `${(ratio * 100).toFixed(3)}% of pixels differ` };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('visual: dist/ is missing or empty. Run "npm run build" first.');
    process.exit(2);
  }
  const all = readdirSync(DIST)
    .filter((name) => name.endsWith('.html'))
    .map((name) => name.replace(/\.html$/, ''))
    .sort();
  const slugs = args.includes('--all') ? all : args.filter((arg) => !arg.startsWith('--'));
  if (slugs.length === 0) {
    console.error('usage: npm run visual -- <slug> [slug ...] | --all');
    process.exit(2);
  }
  const unknown = slugs.filter((slug) => !all.includes(slug));
  if (unknown.length > 0) {
    console.error(`visual: no such page in dist/: ${unknown.join(', ')}`);
    process.exit(2);
  }

  prepareReference();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const [legacyServer, portServer] = await Promise.all([serve(REFERENCE), serve(DIST)]);
  const browser = await chromium.launch();
  const results: Result[] = [];
  try {
    for (const slug of slugs) {
      const path = slug === 'index' ? '' : slug;
      for (const viewport of VIEWPORTS) {
        const [before, after] = await Promise.all([
          capture(browser, `http://127.0.0.1:${port(legacyServer)}/${path}`, viewport.width, viewport.height),
          capture(browser, `http://127.0.0.1:${port(portServer)}/${path}`, viewport.width, viewport.height),
        ]);
        const result = compare(slug, viewport.name, before, after, args.includes('--keep'));
        results.push(result);
        console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${slug} [${viewport.name}] ${result.detail}`);
      }
    }
  } finally {
    await browser.close();
    legacyServer.close();
    portServer.close();
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(
      `\nVisual check FAILED for ${failed.length} of ${results.length} comparison(s). Images: .visual/out/`,
    );
    process.exit(1);
  }
  console.log(`\nVisual check passed: ${results.length} comparison(s).`);
}

await main();
