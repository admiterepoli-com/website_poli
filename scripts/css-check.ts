/**
 * Asserts that the partials imported by src/styles/global.css, concatenated in
 * import order, are byte-for-byte equal to legacy/styles.css. This guarantees
 * that ported pages get exactly the same CSS, in the same cascade order, as
 * legacy pages.
 *
 *   npm run css:check
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const stylesDir = resolve('src/styles');
const legacyPath = resolve('legacy/styles.css');

if (!existsSync(legacyPath)) {
  console.log('css:check skipped: legacy/styles.css no longer exists.');
  process.exit(0);
}

const entry = readFileSync(join(stylesDir, 'global.css'), 'utf8');
const imports = [...entry.matchAll(/^@import\s+'\.\/([^']+)';$/gm)].map((match) => match[1] ?? '');
if (imports.length === 0) {
  console.error('css:check FAILED: src/styles/global.css imports no partials.');
  process.exit(1);
}

const combined = Buffer.concat(imports.map((file) => readFileSync(join(stylesDir, file))));
const legacy = readFileSync(legacyPath);

if (!combined.equals(legacy)) {
  let offset = 0;
  while (offset < combined.length && offset < legacy.length && combined[offset] === legacy[offset]) offset++;
  const line = legacy.subarray(0, offset).toString('utf8').split('\n').length;
  console.error(
    `css:check FAILED: partials differ from legacy/styles.css (first difference near line ${line} of the legacy file).\n` +
      'The split must stay mechanical: do not edit, reorder or remove rules.',
  );
  process.exit(1);
}
console.log(`css:check passed: ${imports.length} partials equal legacy/styles.css (${legacy.length} bytes).`);
