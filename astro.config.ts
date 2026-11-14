import { defineConfig } from 'astro/config';
import legacyPassthrough from './integrations/legacy-passthrough';

// SEO-critical settings: the live site is served by GitHub Pages with clean
// URLs (/informatii is informatii.html). `format: 'file'` keeps every page at
// the same URL; do not change these without updating seo-baseline.json.
export default defineConfig({
  site: 'https://admiterepoli.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [legacyPassthrough()],
  build: {
    format: 'file',
  },
});
