import { defineConfig } from 'astro/config';

// SEO-critical settings: the live site is served by GitHub Pages with clean
// URLs (/informatii is informatii.html). `format: 'file'` keeps every page at
// the same URL; do not change these without updating seo-baseline.json.
export default defineConfig({
  site: 'https://admiterepoli.com',
  output: 'static',
  trailingSlash: 'never',
  // Keep the whitespace of the source markup. Collapsing it changes how inline
  // elements are spaced and makes the text differ from the SEO baseline.
  compressHTML: false,
  vite: {
    build: {
      // The stylesheet must reach the browser rule for rule as it was written: minifiers merge and
      // rewrite rules, and the site's look depends on the exact cascade of the old styles.css.
      cssMinify: false,
    },
  },
  build: {
    format: 'file',
  },
});
