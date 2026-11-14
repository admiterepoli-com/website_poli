import type { AstroIntegration } from 'astro';
import { cp, readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Legacy passthrough.
 *
 * While the site is being ported, every page that has not been rewritten yet
 * still lives in `legacy/` as plain HTML. This integration copies those files
 * into `dist/` after the Astro build, so the built site is always complete.
 *
 * Porting a page = add `src/pages/<slug>.astro` AND delete `legacy/<slug>.html`.
 * If both exist the build fails, because one would silently overwrite the other.
 */
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

async function listFiles(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else out.push(relative(base, full));
  }
  return out.sort();
}

export default function legacyPassthrough(legacyDir = 'legacy'): AstroIntegration {
  let legacyRoot = '';

  return {
    name: 'legacy-passthrough',
    hooks: {
      'astro:config:done': ({ config }) => {
        legacyRoot = join(fileURLToPath(config.root), legacyDir);
      },

      // Dev server: serve legacy files, including clean URLs without `.html`.
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!existsSync(legacyRoot) || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
          const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
          const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
          if (rel.includes('..')) return next();
          const candidates = extname(rel) ? [rel] : [`${rel}.html`];
          const serve = async (): Promise<boolean> => {
            for (const candidate of candidates) {
              const file = join(legacyRoot, candidate);
              if (!existsSync(file) || !(await stat(file)).isFile()) continue;
              res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
              res.end(await readFile(file));
              return true;
            }
            return false;
          };
          serve().then((served) => (served ? undefined : next()), next);
        });
      },

      'astro:build:done': async ({ dir, logger }) => {
        if (!existsSync(legacyRoot)) {
          logger.info('no legacy/ directory, nothing to copy');
          return;
        }
        const outDir = fileURLToPath(dir);
        const files = await listFiles(legacyRoot);
        const collisions = files.filter((file) => existsSync(join(outDir, file)));
        if (collisions.length > 0) {
          throw new Error(
            `legacy-passthrough: these files exist both in ${legacyDir}/ and in the Astro output:\n` +
              collisions.map((file) => `  - ${file}`).join('\n') +
              `\nA ported page must delete its ${legacyDir}/ counterpart in the same PR.`,
          );
        }
        for (const file of files) {
          await cp(join(legacyRoot, file), join(outDir, file));
        }
        logger.info(`copied ${files.length} legacy file(s) into the build output`);
      },
    },
  };
}
