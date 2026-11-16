import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Window globals are declared once, in `src/types/global.d.ts` (#143). A local
 * `Window & { … }` type in a module is a second, possibly different, copy.
 */
const SRC = join(import.meta.dirname, '..');
const GLOBAL_DTS = join(SRC, 'types', 'global.d.ts');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|astro)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

describe('window globals', () => {
  it('are not widened locally outside global.d.ts', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => file !== GLOBAL_DTS)
      .filter((file) => /\bWindow\s*&/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it('declare renderMathInElement exactly once', () => {
    const declarations = sourceFiles(SRC).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/\brenderMathInElement\??\s*:/g)].map(() =>
        relative(SRC, file),
      ),
    );
    expect(declarations).toEqual(['types/global.d.ts']);
  });
});
