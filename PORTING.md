# TypeScript port — contributor and agent guide

This branch (`typescript-port`) is where admiterepoli.com is being ported from hand-written HTML/CSS/JS to **Astro + strict TypeScript**. It acts as the main branch of the port. `main` keeps serving the live site and is not touched until the cutover issue.

To start an agent on any laptop:

> Read PORTING.md and complete the next available typescript-port issue.

## The three rules

1. **Nothing Google sees may change.** Same URLs, same `<title>`, same meta description, same canonical/robots tags, same headings, same body text, same internal links, same image and PDF paths. `npm run seo:check` enforces this against `seo-baseline.json`. If the check fails, the port is wrong, not the baseline. Never edit the baseline to make a PR pass.
2. **Nothing a visitor sees may change.** Reuse the old markup, class names and inline `style=""` attributes as they are. Do not restyle, rename classes, "clean up" copy, or fix typos. `npm run visual -- <slug>` compares the old and new page.
3. **Stay inside your issue.** Edit only the files listed under **Owns** in the issue. If you need a change elsewhere, open a new issue for it (label `typescript-port`) and mention it in your PR.

Existing oddities are intentional for now: only `/` has a canonical tag, four pages are `noindex`, and eleven pages are missing from `sitemap.xml`. Keep them exactly as they are.

## How the port works

- `legacy/` holds the old site. The build copies every legacy page that has no `src/pages/` counterpart straight into `dist/`, so the branch always builds the complete site.
- Porting a page means: add `src/pages/<slug>.astro` (or a data file for a templated page), then delete `legacy/<slug>.html` in the same PR. The build fails if a page exists in both places.
- Astro is configured with `build.format: 'file'` and `trailingSlash: 'never'`, so `src/pages/informatii.astro` becomes `dist/informatii.html`, served at `/informatii` like today.
- Static assets live in `public/` at their old paths (`/pdfs/...`, `/images/...`, `/logosquared.png`).
- Styles are the old `styles.css`, split into ordered partials in `src/styles/`. Order matters; do not reorder or deduplicate.
- Shared data is one file per page (`src/data/pdf-pages/<slug>.ts`, `src/data/simulations/<id>.ts`). There are no shared registry files, so parallel PRs do not conflict.
- TypeScript is strict. No `any`, no `@ts-ignore`; if a type is truly unknown, use `unknown` and narrow it.

Two behaviours must survive exactly as they are:

- The cookie-consent script is a render-blocking inline script placed before the Google Analytics tag.
- The exam-gate safety net (top of the old `main.js`) is a classic inline script that does not depend on the ES module bundle. It exists for visitors whose network blocks the module.

## What wave 0 built, and what it taught us

Read this before porting anything; each point cost a debugging session.

- **`BaseLayout`** (`src/layouts/BaseLayout.astro`) renders the head, cookie consent, analytics, header, footer, popup and auth script. A page passes `title`, `description` and its own `<main>`. Legacy pages are not uniform, so the layout has props for the differences. Check your legacy page against each one:
  - `bodyClass`: 46 pages use `lp-body lp-dark` (default), 21 have none (`bodyClass=""`). The header markup follows from it (`modern` vs `classic`).
  - `fonts`: `jakarta` (default, 43 pages) or `dm-sans` (22 pages). Extra font links go in the `head` slot.
  - `popupNoscript`: `weekly` (default), `info` or `title`. The `<noscript>` text is in the SEO baseline.
  - `popup={false}`, `footer={false}`, `cookieConsent={false}`, `auth={false}`, `footerIconAlt`, `canonical`, `noindex`: only where the legacy page differs.
- **Page styles go at the top of the page's `<body>`, not in the `head` slot** (#173). Astro links the bundled site CSS at the very end of `<head>`, after the `head` slot, and nothing can be rendered after it. On the legacy pages a page's own `<style>` came after `styles.css` and won ties; to keep that, put the legacy `<style>` block as `<style is:inline>` first inside the `BaseLayout` default slot (see the barem pages and `ExamLayout`). Stylesheets that come from npm (KaTeX) are imported in the component's frontmatter instead, so Astro bundles them after `global.css`; import such components after `BaseLayout`. The `head` slot is for fonts, meta tags and classic scripts.
- **The reference example is `src/pages/cti-vs-is.astro`.** Its header comment describes the steps.
- **Do not load `main.js` on a ported page.** Its features are being split into `src/scripts/`; loading it too would bind handlers twice.
- **CSS is not minified and HTML whitespace is not compressed** (`astro.config.ts`). Both changed rendering or the extracted text. Do not turn them back on.
- **Prettier ignores `src/pages/`.** Paste legacy markup as it is. In Astro templates, a literal `{` or `}` in text must be written as `{'{'}` / `{'}'}`.
- **Scripts that must run as classic inline scripts** (before analytics, or when the module bundle fails) use `compileInlineScript` from `src/lib/inline-script.ts`. See `CookieConsent.astro`.
- **Global functions in inline scripts**: do not use `define:vars` on a script that defines globals; it wraps the code in a closure.
- **Compare markup against legacy before trusting it.** Header, footer and popup each turned out to have two or three variants. When you build a shared component, group all legacy pages by their normalised markup first and report the variants in the PR.
- **`npm run visual` needs a browser once:** `npx playwright install chromium`. Use `--keep` to save screenshots even when the page passes. It hides PDF canvases and freezes time, so date-based gates render as of 1 November 2026.
- **Scripts in `scripts/` run directly with Node 22** (`node scripts/x.ts`, type stripping). Use only erasable TypeScript syntax there: no enums, no parameter properties.

## Workflow for one issue

All commands run against `admiterepoli-com/website_poli`.

**1. Pick.** Work the lowest open wave first.

```bash
gh issue list -l typescript-port -l wave-0 --search "no:assignee" --state open
```

Open the issue and read **Depends on**. If any listed issue is still open, pick a different one. Skip issues labelled `needs-human`.

**2. Check the comments, then claim.** This step is mandatory and comes before any other work on the issue, including reading the legacy code.

```bash
gh issue view <N> --comments
```

- If the issue has **no comments**, it is free. Claim it by posting the standard message, exactly in this form:

  ```bash
  gh issue comment <N> --body "🤖 CLAIMED — an agent is working on this issue. Do not start it.
  Agent: $(gh api user -q .login)@$(hostname)
  Started: $(date -u +%Y-%m-%dT%H:%MZ)"
  gh issue edit <N> --add-assignee @me --add-label in-progress
  ```

- If the latest claim comment (`🤖 CLAIMED`) has no `🤖 RELEASED` comment after it, the issue is **taken**. Do not work on it; go back to step 1 and pick another one.
- If the issue has comments but no active claim (only notes, or a claim followed by a release), read them, then claim as above.
- A claim older than 24 hours with no linked PR is stale and may be taken over: post a new `🤖 CLAIMED` comment that mentions the takeover.

After posting, run `gh issue view <N> --comments` once more. If another `🤖 CLAIMED` comment landed before yours, delete your comment, remove your assignment, and pick another issue.

**3. Branch.**

```bash
git fetch origin
git switch -c port/<N>-<short-slug> origin/typescript-port
npm ci
```

**4. Work.** Follow the issue's Goal, Legacy source and Acceptance criteria. The pilot page `src/pages/cti-vs-is.astro` is the reference example for a ported page.

**5. Verify.** All must pass before opening a PR.

```bash
npm run build
npm run check          # astro check + tsc
npm run lint           # eslint + prettier; fix formatting with `npm run format`
npm run css:check
npm run seo:check
npm run visual -- <slug>   # for every page your change affects (not run in CI)
```

**6. Ship.**

```bash
git push -u origin HEAD
gh pr create --base typescript-port --title "<issue title>" --body "Closes #<N>"
gh pr merge --auto --squash
```

CI (`.github/workflows/port-ci.yml`, job `ci`) runs build, check, lint, css:check, seo:check, unit tests and a site smoke test; `typescript-port` is protected and the PR merges by itself when `ci` is green. Merging can lag CI by up to a minute. When the PR merges, a workflow closes the issue named in `Closes #<N>` and removes `in-progress`, so the PR body must contain that line exactly. If the PR conflicts, rebase on `origin/typescript-port` and push again. Never push to `typescript-port` or `main` directly, and never merge with failing checks.

**7. If you get stuck.** Release the issue so someone else can take it: post a comment that starts with `🤖 RELEASED —` followed by what you found, remove `in-progress` and your assignment, and move on. If the blocker needs a secret, a repository setting or a decision that affects SEO, add the `needs-human` label.

## Labels

| Label | Meaning |
| --- | --- |
| `typescript-port` | Every issue of the port |
| `wave-0` | Foundation. Must be finished before anything else starts |
| `wave-1` | Shared libraries, components and Cloud Functions |
| `wave-2` | Pages |
| `wave-3` | Hardening and cutover |
| `in-progress` | Claimed by someone |
| `needs-human` | Needs a person: secret, repo setting or SEO decision |

## Commit and PR conventions

- One issue per PR, squash-merged. PR title = issue title.
- Commit messages in Romanian, in the style of the existing history (for example `Port: pagina informatii în Astro`).
- Do not commit `dist/`, `node_modules/` or screenshots.
