# admiterepoli.com — TypeScript port branch

This branch ports the site to Astro + strict TypeScript. Before doing any work, read `PORTING.md` and follow its workflow exactly.

- Work is tracked as GitHub issues labelled `typescript-port` in `admiterepoli-com/website_poli`.
- SEO and visual parity with the legacy site are hard requirements, enforced by `npm run seo:check` and `npm run visual`.
- Land changes only through a PR into `typescript-port`; never push to `typescript-port` or `main` directly.
- The agent definition for this work is `.claude/agents/typescript-port-worker.md`.
