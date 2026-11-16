/**
 * Pages listed in sitemap.xml (src/pages/sitemap.xml.ts renders it), in the order and groups of the
 * hand-written file it replaces. The list is explicit on purpose: eleven pages are not in the
 * sitemap today, and adding them is an SEO decision (#95), not something a new page does by itself.
 *
 * `seo:check` compares the built sitemap.xml byte for byte with the baseline, so any change here
 * must be deliberate and go with an updated baseline.
 */

/** One `<url>`: the path after https://admiterepoli.com and its `<priority>` as written today. */
export interface SitemapUrl {
  path: `/${string}`;
  priority: `${number}.${number}`;
}

/** A group of URLs, preceded in the file by `<!-- label -->`. */
export interface SitemapGroup {
  label: string;
  urls: readonly SitemapUrl[];
}

export const SITE_ORIGIN = 'https://admiterepoli.com';

export const SITEMAP: readonly SitemapGroup[] = [
  {
    label: 'Pagini principale',
    urls: [
      { path: '/', priority: '1.00' },
      { path: '/informatii', priority: '0.80' },
      { path: '/subiecte', priority: '0.80' },
      { path: '/resurse', priority: '0.80' },
      { path: '/simulari', priority: '0.80' },
      { path: '/exercitii-video', priority: '0.80' },
      { path: '/cti-vs-is', priority: '0.80' },
      { path: '/etti-vs-cti', priority: '0.80' },
      { path: '/contact', priority: '0.60' },
    ],
  },
  {
    label: 'Simulări AdmiterePoli',
    urls: [
      { path: '/simulare-2026-03-21', priority: '0.70' },
      { path: '/simulare-2026-03-26', priority: '0.70' },
      { path: '/barem-simulare-admiterepoli-1', priority: '0.70' },
      { path: '/barem-simulare-admiterepoli-2', priority: '0.70' },
      { path: '/rezolvare-simulare-admiterepoli-1', priority: '0.70' },
      { path: '/rezolvare-simulare-admiterepoli-2', priority: '0.70' },
    ],
  },
  {
    label: 'Preadmitere 2026',
    urls: [
      { path: '/preadmitere-2026-mate-subiect', priority: '0.70' },
      { path: '/preadmitere-2026-matematica-barem', priority: '0.70' },
      { path: '/rezolvare-preadmitere-2026-matematica', priority: '0.70' },
      { path: '/preadmitere-2026-info-subiect', priority: '0.70' },
      { path: '/preadmitere-2026-informatica-barem', priority: '0.70' },
      { path: '/rezolvare-preadmitere-2026-informatica', priority: '0.70' },
    ],
  },
  {
    label: 'Simulare 2026',
    urls: [
      { path: '/simulare-2026-matematica-barem', priority: '0.70' },
      { path: '/rezolvare-simulare-2026-matematica', priority: '0.70' },
      { path: '/simulare-2026-informatica-barem', priority: '0.70' },
      { path: '/rezolvare-simulare-2026-informatica', priority: '0.70' },
    ],
  },
  {
    label: 'Admitere 2025',
    urls: [
      { path: '/admitere-2025-matematica-barem', priority: '0.70' },
      { path: '/rezolvare-admitere-2025-matematica', priority: '0.70' },
      { path: '/admitere-2025-informatica-barem', priority: '0.70' },
      { path: '/rezolvare-admitere-2025-informatica', priority: '0.70' },
    ],
  },
  {
    label: 'Preadmitere 2025',
    urls: [
      { path: '/preadmitere-2025-matematica-barem', priority: '0.70' },
      { path: '/rezolvare-preadmitere-2025-matematica', priority: '0.70' },
      { path: '/preadmitere-2025-info-subiect', priority: '0.70' },
      { path: '/preadmitere-2025-informatica-barem', priority: '0.70' },
    ],
  },
  {
    label: 'Simulare 2025',
    urls: [
      { path: '/simulare-2025-matematica-barem', priority: '0.70' },
      { path: '/simulare-2025-informatica-barem', priority: '0.70' },
    ],
  },
  {
    label: 'Admitere 2024',
    urls: [
      { path: '/admitere-2024-matematica-barem', priority: '0.65' },
      { path: '/admitere-2024-informatica-barem', priority: '0.65' },
      { path: '/rezolvare-admitere-2024-informatica', priority: '0.65' },
    ],
  },
  {
    label: 'Preadmitere 2024',
    urls: [
      { path: '/preadmitere-2024-matematica-barem', priority: '0.65' },
      { path: '/rezolvare-preadmitere-2024-matematica', priority: '0.65' },
      { path: '/preadmitere-2024-informatica-barem', priority: '0.65' },
    ],
  },
  {
    label: 'Simulare 2024',
    urls: [
      { path: '/simulare-2024-matematica-barem', priority: '0.65' },
      { path: '/rezolvare-simulare-2024-matematica', priority: '0.65' },
      { path: '/simulare-2024-informatica-barem', priority: '0.65' },
      { path: '/rezolvare-simulare-2024-informatica', priority: '0.65' },
    ],
  },
  {
    label: 'Admitere 2023',
    urls: [
      { path: '/admitere-2023-matematica-barem', priority: '0.60' },
      { path: '/admitere-2023-informatica-barem', priority: '0.60' },
      { path: '/rezolvare-admitere-2023-informatica', priority: '0.60' },
    ],
  },
  {
    label: 'Preadmitere 2023',
    urls: [
      { path: '/preadmitere-2023-matematica-barem', priority: '0.60' },
      { path: '/preadmitere-2023-informatica-barem', priority: '0.60' },
      { path: '/rezolvare-preadmitere-2023-informatica', priority: '0.60' },
    ],
  },
  {
    label: 'Simulare 2023',
    urls: [
      { path: '/simulare-2023-matematica-barem', priority: '0.60' },
      { path: '/simulare-2023-informatica-barem', priority: '0.60' },
      { path: '/rezolvare-simulare-2023-matematica', priority: '0.60' },
    ],
  },
  {
    label: 'Unibuc / Mate-Info',
    urls: [
      { path: '/rezolvare-admitere-unibuc-2025-informatica', priority: '0.60' },
      { path: '/mateinfub-2023-ii-informatica-barem', priority: '0.60' },
      { path: '/rezolvare-mateinfub-2023-ii-informatica', priority: '0.60' },
    ],
  },
];
