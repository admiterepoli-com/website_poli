/**
 * Visual regression: renders a page from the legacy reference site and from the
 * current build, and compares full-page screenshots at desktop and mobile width.
 *
 *   npm run build
 *   npm run visual -- cti-vs-is          one page (slug without .html)
 *   npm run visual -- index contact      several pages
 *   npm run visual -- --all              every page in dist/, plus the dynamic STATES below
 *   npm run visual -- --states           only the dynamic states (open menu, modal, dropdowns)
 *   npm run visual -- --keep <slug>      also save the screenshots when the page passes
 *
 * Diff images are written to .visual/out/ (gitignored). Exit code 1 if any page
 * differs by more than MAX_DIFF_RATIO.
 *
 * Determinism: time is frozen at FIXED_TIME, animations and transitions are
 * disabled, analytics is blocked, and PDF canvases are hidden (their layout box
 * is still compared, their pixels are not).
 * Before the screenshot it waits for every image and web font; a comparison that
 * fails is captured once more before it counts, so a long --all run is not
 * failed by a page caught before it settled.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, resolve } from 'node:path';
import pixelmatch from 'pixelmatch';
import { chromium, type Browser, type Page } from 'playwright';
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

/** A state of the page reached after load (open menu, open modal, …), compared like the page itself. */
export interface VisualState {
  name: string;
  slug: string;
  viewport: (typeof VIEWPORTS)[number]['name'];
  /** Runs in the page after it has settled; must work on the legacy reference and on the port. */
  act: (page: Page) => Promise<void>;
}

/** Longest real (not page-clock) time to wait for images and fonts before taking the screenshot anyway. */
const ASSET_WAIT_MS = 10_000;

/**
 * Waits until every eagerly loaded <img> has finished (or failed) and web fonts are ready, for at
 * most ASSET_WAIT_MS. Lazy images are skipped: below the fold they never start loading. The page
 * clock is frozen, so the limit is a Node timer, not one inside the page.
 */
async function waitForAssets(page: Page): Promise<void> {
  const settled = page.evaluate(async () => {
    const pending = [...document.images].filter((img) => !img.complete && img.loading !== 'lazy');
    await Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((done) => {
            img.addEventListener('load', () => done(), { once: true });
            img.addEventListener('error', () => done(), { once: true });
          }),
      ),
    );
    await document.fonts.ready;
  });
  let timer: NodeJS.Timeout | undefined;
  const limit = new Promise<void>((done) => {
    timer = setTimeout(done, ASSET_WAIT_MS);
  });
  await Promise.race([settled, limit]);
  clearTimeout(timer);
}

/**
 * States reached after load that the per-page screenshots do not show. Each runs the same action
 * on the legacy reference and on the port (both expose the same ids, classes and globals).
 */
const STATES: readonly VisualState[] = [
  { name: 'hamburger-open', slug: 'informatii', viewport: 'mobile', act: (page) => page.click('.hamburger') },
  {
    name: 'auth-modal',
    slug: 'index',
    viewport: 'desktop',
    act: async (page) => {
      await page.waitForFunction(() => typeof window.openModal === 'function');
      await page.evaluate(() => window.openModal?.());
    },
  },
  {
    name: 'subiecte-dropdown',
    slug: 'subiecte',
    viewport: 'desktop',
    act: (page) => page.click('.subiecte-box[data-set="2025"]'),
  },
  {
    name: 'simulari-dropdown',
    slug: 'simulari',
    viewport: 'mobile',
    act: (page) => page.click('.subiecte-box[data-set="arhiva-sim-2"]'),
  },
  {
    name: 'info-cards',
    slug: 'informatii',
    viewport: 'desktop',
    act: (page) => page.click('.info-card >> nth=0'),
  },
];

async function capture(
  browser: Browser,
  url: string,
  width: number,
  height: number,
  act?: (page: Page) => Promise<void>,
): Promise<PNG> {
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
  await waitForAssets(page);
  await page.waitForLoadState('networkidle').catch(() => undefined);
  if (act) {
    await act(page);
    await page.clock.runFor(1000);
    await waitForAssets(page);
  }
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
  if (slugs.length === 0 && !args.includes('--states')) {
    console.error('usage: npm run visual -- <slug> [slug ...] | --all | --states');
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
  const keep = args.includes('--keep');
  const withStates = args.includes('--all') || args.includes('--states');

  /** Captures both sites and compares; a failure is captured once more, since a long run can catch a page before it settled. */
  async function check(
    label: string,
    path: string,
    viewport: (typeof VIEWPORTS)[number],
    act?: (page: Page) => Promise<void>,
  ): Promise<void> {
    const shot = (server: Server): Promise<PNG> =>
      capture(browser, `http://127.0.0.1:${port(server)}/${path}`, viewport.width, viewport.height, act);
    let [before, after] = await Promise.all([shot(legacyServer), shot(portServer)]);
    let result = compare(label, viewport.name, before, after, keep);
    if (!result.ok) {
      [before, after] = await Promise.all([shot(legacyServer), shot(portServer)]);
      result = compare(label, viewport.name, before, after, keep);
      result.detail += ' (after a retry)';
    }
    results.push(result);
    console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${label} [${viewport.name}] ${result.detail}`);
  }

  try {
    for (const slug of slugs) {
      const path = slug === 'index' ? '' : slug;
      for (const viewport of VIEWPORTS) await check(slug, path, viewport);
    }
    if (withStates) {
      for (const state of STATES) {
        const viewport = VIEWPORTS.find((v) => v.name === state.viewport);
        if (!viewport) continue;
        await check(
          `${state.slug}#${state.name}`,
          state.slug === 'index' ? '' : state.slug,
          viewport,
          state.act,
        );
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
