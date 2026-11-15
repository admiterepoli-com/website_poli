/**
 * Data of one barem / subiect / rezolvare page (intro + useful links + PDF +
 * related links). One file per page in this folder; the file name is the slug:
 *
 *   src/data/pdf-pages/<slug>.ts  ->  /<slug>
 *
 *   import type { PdfPageData } from './_schema';
 *   export default { slug: '<slug>', ... } satisfies PdfPageData;
 *
 * `src/pages/[slug].astro` picks up every file here (except those starting
 * with `_`) and renders it with `src/layouts/PdfPageLayout.astro`. Adding a
 * page needs nothing else, apart from deleting `legacy/<slug>.html`.
 *
 * Copy every text, href and path from the legacy page character for
 * character: all of it is in the SEO baseline.
 */

export interface PdfPageLink {
  /** Exactly as in the legacy `href`, e.g. `./admitere-2025-informatica-barem` or a full URL. */
  href: string;
  label: string;
  /** The legacy link has `target="_blank"`. */
  external?: boolean;
  /**
   * The legacy `<li>` has no `style="margin-bottom: 0.5rem;"`. On most pages
   * this is the last useful link; on a few it is the last related link, and
   * some lists have no such item at all, so it is stated per link.
   */
  noMargin?: boolean;
}

/**
 * The two markup generations of the legacy pages:
 *
 * - `inline`: the useful links sit in an inline-styled box, the two list
 *   headings and every link carry inline styles (`color: #C3D5F0`,
 *   `color: lightblue`). Barem and subiect pages, and the older rezolvare pages.
 * - `links-box`: the box is `<div class="pag-links-box">`, headings and links
 *   have no inline styles. Newer rezolvare pages.
 */
export type PdfPageVariant = 'inline' | 'links-box';

interface PdfPageCommon {
  /** Must equal the file name without `.ts`. */
  slug: string;
  /** `<title>`. */
  title: string;
  /** `<meta name="description">`. */
  description: string;
  h1: string;
  /** Text of the `<h3 class="indented">` under the h1 (plain text on every legacy page). */
  intro: string;
  variant: PdfPageVariant;
  /** Heading of the links box, with its emoji where the legacy page has one, e.g. `🔗 Linkuri utile:`. */
  usefulLinksHeading: string;
  usefulLinks: readonly PdfPageLink[];
  /** Heading of the list under the PDF, e.g. `Subiecte similare care te-ar putea ajuta:`. */
  relatedHeading: string;
  related: readonly PdfPageLink[];
  /**
   * Three legacy pages (`preadmitere-2026-info-subiect`,
   * `rezolvare-preadmitere-2026-informatica`, `rezolvare-preadmitere-2026-matematica`)
   * have a leftover `-->` after the footer. It is visible text and part of the
   * SEO baseline, so those pages set this to keep it.
   */
  strayCommentEnd?: boolean;
}

/** A page that shows a PDF. Legacy: `lp-body lp-dark` body, Plus Jakarta Sans. */
export interface PdfPageWithPdf extends PdfPageCommon {
  /** PDF path exactly as in the legacy `const url = "..."`, e.g. `pdfs/admitere2025-mate-barem.pdf`. */
  pdf: string;
  /** Text shown when the PDF fails to load; it differs per page (`baremului`, `subiectului`, `rezolvării`, `rezolvarii`). */
  errorMessage: string;
  pendingMessage?: never;
}

/**
 * A page whose PDF is not published yet: it shows a centred text box instead
 * of the viewer. Legacy: no body class, DM Sans, classic header.
 */
export interface PdfPagePending extends PdfPageCommon {
  /** Text of the box, e.g. `Baremul va fi disponibil în curând.` */
  pendingMessage: string;
  pdf?: never;
  errorMessage?: never;
}

export type PdfPageData = PdfPageWithPdf | PdfPagePending;
