# admiterepoli.com

Free and paid preparation material for the admission exams at Politehnica University of
Bucharest (UPB): past exam papers with answer keys and worked solutions, timed online
simulations, video exercises and general admission information. All content is in Romanian.

Live site: https://admiterepoli.com

## Stack

- **Site**: [Astro](https://astro.build) (static output) + strict TypeScript. Every page is
  pre-rendered to plain HTML in `dist/`; the browser scripts are small TypeScript modules.
- **Accounts and data**: Firebase Auth + Firestore (named database `admiterepoli`), used from
  the npm Firebase SDK.
- **Payments**: Gumroad. A Cloud Function (`functions/`, Node 20, TypeScript) receives the
  Gumroad webhook and updates the user's status in Firestore; scheduled functions expire
  trials and fixed-term plans.
- **Other services**: Google Analytics 4 (only after cookie consent), Web3Forms (contact form),
  Google Apps Script (simulation results sheet), YouTube (video exercises).

## Run it

Node 22 (see `.nvmrc`).

```bash
npm ci
npm run dev        # dev server with reload
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
```

## Checks

All of these run in CI on every pull request (`.github/workflows/port-ci.yml`):

```bash
npm run check      # astro check + tsc (strict)
npm run lint       # eslint + prettier; `npm run format` fixes formatting
npm test           # unit tests (Vitest)
npm run seo:check  # after a build: compares dist/ with seo-baseline.json
npm --prefix functions run build && npm --prefix functions run lint && npm --prefix functions test
```

`npm run visual -- <slug>` (or `-- --all`) compares screenshots of the built pages with the
pre-port site at desktop and mobile width. It needs `npx playwright install chromium` once and
does not run in CI.

### The SEO baseline

`seo-baseline.json` records what search engines read from each page (title, description,
headings, links, images, a hash of the visible text) plus hashes of `sitemap.xml`,
`robots.txt`, PDFs and images. `seo:check` fails on any difference, including a new page.

When a change to what Google sees is intended (new page, new text, new PDF), regenerate the
baseline from the build and commit it with the change, so the diff shows exactly what changed:

```bash
npm run build && node scripts/seo-snapshot.ts dist > seo-baseline.json
git diff seo-baseline.json
```

Never regenerate it just to make an unexpected failure go away.

## Layout of the repository

```
src/
  pages/             one .astro file per page; [slug].astro renders the PDF-template pages
  layouts/           BaseLayout (head, header, footer, popup, auth), ExamLayout, PdfPageLayout, LegalLayout
  components/        shared markup (header, footer, popup, KaTeX, PDF viewer, landing sections, …)
  data/
    pdf-pages/       one data file per barem / subiect / rezolvare page
    simulations/     one data file per timed simulation
    exercitii-video.ts, sitemap.ts
  lib/
    firebase/        auth, gates, plans and prices (offers.ts), simulation locks, results
    exam/            the exam engine: rendering, timer, scoring, results
  scripts/           browser scripts of single pages (profile, exercitii-video, countdown, …)
  styles/            the global stylesheet, split into ordered partials (order matters)
shared/              Firestore document types shared by the site and the Cloud Functions
functions/           Cloud Functions (Gumroad webhook, scheduled expiries)
public/              files served as they are: images/, pdfs/, robots.txt, CNAME, .nojekyll
scripts/             seo-check, seo-snapshot, visual
```

## Common tasks

### Add a barem, subiect or rezolvare page with a PDF

1. Put the PDF in `public/pdfs/`.
2. Add `src/data/pdf-pages/<slug>.ts`; copy an existing file such as
   `admitere-2025-matematica-barem.ts`. The fields are documented in
   `src/data/pdf-pages/_schema.ts`. A page whose PDF is not published yet uses
   `pendingMessage` instead of `pdf`.
3. `src/pages/[slug].astro` picks the file up; the page is served at `/<slug>`.
4. Link it from `subiecte.astro` (and the related pages), add it to `src/data/sitemap.ts` if it
   should be indexed, then update the SEO baseline as described above.

### Add a timed simulation

1. Add `src/data/simulations/<YYYY-MM-DD>.ts` with `defineSimulation({...})`; copy
   `2026-07-21.ts` for a paid simulation with the Informatică / Fizică choice, or
   `2026-03-21.ts` for a free one. `_schema.ts` documents and validates every field (a broken
   file fails the build). For a paid simulation set `startsAt` / `startsAtLabel`: the gate opens
   at that moment and has no default.
2. Add `src/pages/simulare-<YYYY-MM-DD>.astro` on `ExamLayout`; copy the page of the simulation
   you started from.
3. For a paid simulation, list it in `PAID_SIMULATIONS` (`src/lib/firebase/simulari-lock.ts`)
   and give its Gumroad permalink to `access.simulationId`; add it to the archive on
   `simulari.astro`.

### Change a price

Student Plus prices and Gumroad products are in `src/lib/firebase/offers.ts`
(`STUDENT_PLUS_OFFERS`); the landing page, the plan picker and the profile page read them
from there.

## Deployment

- **Site**: `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every
  push to `main` (after the repository's Pages source is set to "GitHub Actions").
  `firebase.json` can also serve `dist/` from Firebase Hosting (`firebase deploy --only hosting`
  runs the build first).
- **Cloud Functions**: `firebase deploy --only functions`. The webhook needs the
  `WEBHOOK_TOKEN` environment variable; logs: `firebase functions:log --only gumroadWebhook`.

Changes reach `main` through pull requests; CI must be green.
