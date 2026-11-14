/**
 * SEO parity check: compares the built site (dist/) with seo-baseline.json.
 * Fails on any missing page, extra page, changed field, or changed/missing
 * sitemap, robots.txt, CNAME, PDF or image.
 *
 *   npm run build && npm run seo:check
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { snapshotSite, type PageSnapshot, type SiteSnapshot } from './seo-snapshot.ts';

const siteDir = resolve(process.argv[2] ?? 'dist');
const baselinePath = resolve('seo-baseline.json');

if (!existsSync(siteDir)) {
  console.error(`seo:check: ${siteDir} does not exist. Run "npm run build" first.`);
  process.exit(2);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as SiteSnapshot;
const current = snapshotSite([siteDir]);
const problems: string[] = [];

const show = (value: unknown): string => (value === null ? '(none)' : JSON.stringify(value));

function diffList(page: string, field: string, before: string[], after: string[]): void {
  if (before.length === after.length && before.every((value, i) => value === after[i])) return;
  const removed = before.filter((value) => !after.includes(value));
  const added = after.filter((value) => !before.includes(value));
  const lines = [`${page}: ${field} changed`];
  for (const value of removed) lines.push(`      - removed: ${value}`);
  for (const value of added) lines.push(`      + added:   ${value}`);
  if (removed.length === 0 && added.length === 0) lines.push('      order or duplicates changed');
  problems.push(lines.join('\n'));
}

const SCALARS = ['title', 'description', 'canonical', 'robots', 'lang'] as const;
const LISTS = ['headings', 'internalLinks', 'externalLinks', 'images'] as const;

function diffPage(page: string, before: PageSnapshot, after: PageSnapshot): void {
  for (const field of SCALARS) {
    if (before[field] !== after[field]) {
      problems.push(
        `${page}: ${field} changed\n      - was: ${show(before[field])}\n      + now: ${show(after[field])}`,
      );
    }
  }
  for (const field of LISTS) diffList(page, field, before[field], after[field]);
  if (before.textHash !== after.textHash) {
    problems.push(
      `${page}: visible body text changed (${before.textWords} words before, ${after.textWords} now)`,
    );
  }
}

for (const [page, before] of Object.entries(baseline.pages)) {
  const after = current.pages[page];
  if (after === undefined) problems.push(`${page}: page is missing from the build (this URL would 404)`);
  else diffPage(page, before, after);
}
for (const page of Object.keys(current.pages)) {
  if (!(page in baseline.pages)) problems.push(`${page}: new page that is not in the baseline`);
}

for (const [file, hash] of Object.entries(baseline.files)) {
  const now = current.files[file];
  if (now === undefined) problems.push(`${file}: file is missing from the build`);
  else if (now !== hash) problems.push(`${file}: file content changed`);
}
for (const file of Object.keys(current.files)) {
  if (!(file in baseline.files)) problems.push(`${file}: new file that is not in the baseline`);
}

if (problems.length > 0) {
  console.error(`SEO parity check FAILED: ${problems.length} difference(s) from seo-baseline.json\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nFix the port so it matches the baseline. Do not edit seo-baseline.json.');
  process.exit(1);
}
console.log(
  `SEO parity check passed: ${Object.keys(baseline.pages).length} pages and ${Object.keys(baseline.files).length} files match the baseline.`,
);
