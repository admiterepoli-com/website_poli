# Performance report: legacy site vs Astro port

Lighthouse 12 through `@lhci/cli` (`lighthouserc.json`): mobile profile (simulated throttling), performance category only, five pages, **5 runs each, median**. Reference: the pre-port site rebuilt from git at `5e38b37`; port: `dist/`. Both served by the same local static server; runs **interleaved** (legacy, port, legacy, …) so that both see the same third-party network conditions (Google Fonts, Analytics, Firebase CDN).

A first, non-interleaved measurement (all legacy runs, then all port runs) is not used: the Google Fonts CSS took 240 ms during the legacy runs and 620 ms during the port runs, and Lighthouse's simulation carries such observed latencies into LCP.

## After the fix (this PR)

| Page | Metric | Legacy | Port | Change |
| --- | --- | --- | --- | --- |
| `admitere-2025-matematica-barem` | SCORE | 89 | 90 | +1% |
| `admitere-2025-matematica-barem` | LCP | 3.15 s | 3.01 s | -5% |
| `admitere-2025-matematica-barem` | CLS | 0.014 | 0.000 | -0.014 |
| `admitere-2025-matematica-barem` | TBT | 144 ms | 104 ms | -28% |
| `admitere-2025-matematica-barem` | JS | 582 KiB | 511 KiB | -12% |
| `admitere-2025-matematica-barem` | CSS | 48 KiB | 48 KiB | +1% |
| `exercitii-video` | SCORE | 90 | 82 | -9% |
| `exercitii-video` | LCP | 2.95 s | 3.46 s | +17% |
| `exercitii-video` | CLS | 0.009 | 0.011 | 0.002 |
| `exercitii-video` | TBT | 187 ms | 265 ms | +42% |
| `exercitii-video` | JS | 508 KiB | 431 KiB | -15% |
| `exercitii-video` | CSS | 48 KiB | 48 KiB | +1% |
| `index` | SCORE | 83 | 83 | +0% |
| `index` | LCP | 3.65 s | 3.85 s | +6% |
| `index` | CLS | 0.000 | 0.002 | 0.002 |
| `index` | TBT | 247 ms | 174 ms | -30% |
| `index` | JS | 551 KiB | 426 KiB | -23% |
| `index` | CSS | 48 KiB | 48 KiB | +1% |
| `simulare-2026-03-21` | SCORE | 81 | 82 | +1% |
| `simulare-2026-03-21` | LCP | 3.15 s | 3.00 s | -5% |
| `simulare-2026-03-21` | CLS | 0.190 | 0.190 | 0.000 |
| `simulare-2026-03-21` | TBT | 99 ms | 147 ms | +48% |
| `simulare-2026-03-21` | JS | 572 KiB | 512 KiB | -10% |
| `simulare-2026-03-21` | CSS | 51 KiB | 56 KiB | +11% |
| `subiecte` | SCORE | 93 | 91 | -2% |
| `subiecte` | LCP | 2.71 s | 2.71 s | -0% |
| `subiecte` | CLS | 0.001 | 0.000 | -0.001 |
| `subiecte` | TBT | 118 ms | 127 ms | +8% |
| `subiecte` | JS | 509 KiB | 426 KiB | -16% |
| `subiecte` | CSS | 48 KiB | 48 KiB | +1% |

## Before the fix (interleaved, same method)

| Page | Metric | Legacy | Port | Change |
| --- | --- | --- | --- | --- |
| `admitere-2025-matematica-barem` | SCORE | 90 | 86 | -4% |
| `admitere-2025-matematica-barem` | LCP | 3.15 s | 3.46 s | +10% |
| `admitere-2025-matematica-barem` | CLS | 0.000 | 0.000 | 0.000 |
| `admitere-2025-matematica-barem` | TBT | 146 ms | 109 ms | -25% |
| `admitere-2025-matematica-barem` | JS | 582 KiB | 510 KiB | -12% |
| `admitere-2025-matematica-barem` | CSS | 48 KiB | 48 KiB | +1% |
| `exercitii-video` | SCORE | 90 | 81 | -10% |
| `exercitii-video` | LCP | 2.98 s | 3.61 s | +21% |
| `exercitii-video` | CLS | 0.009 | 0.011 | 0.002 |
| `exercitii-video` | TBT | 177 ms | 307 ms | +73% |
| `exercitii-video` | JS | 508 KiB | 429 KiB | -15% |
| `exercitii-video` | CSS | 48 KiB | 48 KiB | +1% |
| `index` | SCORE | 75 | 77 | +3% |
| `index` | LCP | 4.62 s | 4.88 s | +6% |
| `index` | CLS | 0.001 | 0.000 | -0.001 |
| `index` | TBT | 259 ms | 185 ms | -29% |
| `index` | JS | 551 KiB | 425 KiB | -23% |
| `index` | CSS | 48 KiB | 48 KiB | +1% |
| `simulare-2026-03-21` | SCORE | 81 | 77 | -5% |
| `simulare-2026-03-21` | LCP | 2.86 s | 3.46 s | +21% |
| `simulare-2026-03-21` | CLS | 0.190 | 0.190 | 0.000 |
| `simulare-2026-03-21` | TBT | 99 ms | 110 ms | +11% |
| `simulare-2026-03-21` | JS | 572 KiB | 511 KiB | -11% |
| `simulare-2026-03-21` | CSS | 51 KiB | 56 KiB | +11% |
| `subiecte` | SCORE | 93 | 88 | -5% |
| `subiecte` | LCP | 2.71 s | 3.16 s | +17% |
| `subiecte` | CLS | 0.000 | 0.000 | 0.000 |
| `subiecte` | TBT | 121 ms | 205 ms | +70% |
| `subiecte` | JS | 509 KiB | 425 KiB | -17% |
| `subiecte` | CSS | 48 KiB | 48 KiB | +1% |

## What was found and fixed

**LCP / FCP +10–21% on four pages.** The LCP element was text on every page; the whole regression was render delay (FCP 300–500 ms later), with the same main-thread work and the same render-blocking resources. The difference: the port bundles the Firebase SDK and evaluated it before the first paint, and Lighthouse's 4× CPU slowdown counts that task in FCP. The legacy pages fetched the SDK from the gstatic CDN, so it ran after the first paint.

Fix: `BaseLayout` now imports the auth entry module after the first frame (`requestAnimationFrame` → `setTimeout` → `import()`), and `src/lib/firebase/entry.ts` initialises when the module arrives instead of waiting for a `DOMContentLoaded` that may already have fired. Result: `subiecte` LCP equal to legacy (2.71 s), the barem page and simulation 1 now 5% faster than legacy.

Behaviour checked after the change: e2e suite (8/8), visual states, exam gate of simulation 4 (signed out / free / paid, two dates), `simulari` and `profil` signed in with the free and paid test accounts — all identical to legacy.

Moving the global stylesheet to the top of `<head>` (where legacy had `styles.css`) was tried and made no difference, so it was not changed.

## Follow-up: `exercitii-video` page CSS

The page's own stylesheet (the ~700-line legacy `<style>`) is now `src/styles/pages/exercitii-video.css`, imported by the page after `BaseLayout`, so Astro links it in `<head>` right after the site CSS. That is the same position and cascade order as on the legacy page, where the `<style>` sat in `<head>` after `styles.css`. Visual parity: 0.000% pixel difference on desktop and mobile. Not re-measured with Lighthouse in this change.

## Still above the 5% budget

| Page | Metric | Diagnosis | Suggested next step |
| --- | --- | --- | --- |
| `exercitii-video` | LCP +15–17%, TBT +40–85% | The page's own ~700-line `<style>` now sits at the top of `<body>` (rule from #173) instead of in `<head>`; the LCP element (`.ev-hero-sub`) is styled by it, adding render delay. Deferring the page script was tried and did not help (reverted). | Move this page's CSS into a stylesheet bundled with the page (a `.css` import in the page), so it is linked in `<head>` after the global CSS; re-check visual parity. |
| `simulare-2026-03-21` | TBT +48% (99 → 147 ms) | Two long tasks in the exam bundle: rendering the 20 questions and running KaTeX over them, now in one task right after load. Legacy did the same work, split across the CDN scripts. 147 ms is still inside Lighthouse's "good" range (< 200 ms). | Render KaTeX per section in separate tasks (or on tab switch). |
| `index` | LCP +5–6% | Within run-to-run variation of this page (±0.2 s across rounds). | Re-measure after the two items above. |
| simulation CSS | +11% (51 → 56 KiB) | Measurement artefact: the local server does not compress, while legacy's KaTeX stylesheet came gzip-compressed from jsDelivr. Production hosting compresses both. | None. |

JavaScript transferred is **10–23% smaller** on every page (no separate Firebase CDN modules, no KaTeX CDN scripts, no `main.js`). CLS is unchanged (the 0.19 of the simulation page exists on legacy too).
