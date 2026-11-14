---
name: typescript-port-worker
description: Picks up one open `typescript-port` issue from admiterepoli-com/website_poli, claims it, implements it on its own branch and ships it as an auto-merging PR into the `typescript-port` branch. Use when asked to work on the TypeScript port, to "do the next port issue", or to solve a specific port issue number.
---

You work on the TypeScript port of admiterepoli.com (a static site being moved from hand-written HTML/CSS/JS to Astro + strict TypeScript). The work is split into GitHub issues labelled `typescript-port` in the repository `admiterepoli-com/website_poli`. Many agents on different laptops work on these issues at the same time, so the claiming steps below are what keeps two agents from doing the same issue. Follow them in order and do not skip any.

You complete exactly one issue per run, then stop and report.

## Setup

1. You need a clone of `admiterepoli-com/website_poli` and a logged-in `gh` CLI. If either is missing, stop and say so.
2. Run `git fetch origin` and read `PORTING.md` from `origin/typescript-port` (`git show origin/typescript-port:PORTING.md`). It is the source of truth; if it disagrees with this file, follow `PORTING.md`.

## Step 1: choose an issue

If you were given an issue number, use it. Otherwise list free issues, lowest wave first:

```bash
gh issue list -R admiterepoli-com/website_poli -l typescript-port -l wave-0 --search "no:assignee" --state open
```

Move to `wave-1`, then `wave-2`, then `wave-3` only when the earlier wave has nothing free. Skip issues labelled `needs-human` or `in-progress`. Open the candidate and read its **Depends on** list: if any issue named there is still open, choose another candidate.

## Step 2: check the comments before anything else

```bash
gh issue view <N> -R admiterepoli-com/website_poli --comments
```

- **No comments:** the issue is free. Go to step 3.
- **Latest `🤖 CLAIMED` comment with no `🤖 RELEASED` comment after it:** the issue is taken. Do not touch it. Return to step 1.
- **Comments but no active claim:** read them (they may contain findings from a previous attempt), then go to step 3.
- **A claim older than 24 hours with no linked PR:** stale. You may take it over and must say so in your claim comment.

## Step 3: claim it with the standard message

Post exactly this, before reading legacy code or writing anything:

```bash
gh issue comment <N> -R admiterepoli-com/website_poli --body "🤖 CLAIMED — an agent is working on this issue. Do not start it.
Agent: $(gh api user -q .login)@$(hostname)
Started: $(date -u +%Y-%m-%dT%H:%MZ)"
gh issue edit <N> -R admiterepoli-com/website_poli --add-assignee @me --add-label in-progress
```

Then view the comments again. If another `🤖 CLAIMED` comment was posted before yours, you lost the race: delete your comment, remove your assignment and the `in-progress` label, and return to step 1.

## Step 4: do the work

```bash
git switch -c port/<N>-<short-slug> origin/typescript-port
npm ci
```

Implement what the issue's **Goal** and **Acceptance criteria** describe, using the **Legacy source** it points to. Hard rules:

- Edit only the files listed under **Owns**. If something outside them must change, open a new `typescript-port` issue for it and leave it alone.
- Nothing Google sees may change: URLs, titles, meta descriptions, canonical and robots tags, headings, body text, internal links, image and PDF paths. Never edit `seo-baseline.json` to make a check pass.
- Nothing a visitor sees may change: keep the old markup, class names and inline styles. Do not restyle, reword or fix typos.
- Strict TypeScript: no `any`, no `@ts-ignore`.
- Keep the cookie-consent script inline and ahead of the analytics tag, and keep the exam-gate safety net as a classic inline script independent of the module bundle.

## Step 5: verify

```bash
npm run build && npm run check && npm run lint && npm run seo:check
npm run visual -- <slug>     # once per page your change affects
```

Everything must pass. A failing parity check means the port is wrong; fix the port. (Some of these scripts are created by wave-0 issues. If you are working on wave 0 and a script does not exist yet, run the ones that do and say which were unavailable in the PR.)

## Step 6: ship

```bash
git push -u origin HEAD
gh pr create -R admiterepoli-com/website_poli --base typescript-port --title "<issue title>" --body "Closes #<N>"
gh pr merge --auto --squash
```

Never push to `typescript-port` or `main` directly. If the PR conflicts, rebase on `origin/typescript-port` and push again. Commit messages are in Romanian, matching the repository history.

## If you cannot finish

Release the issue so another agent can take it:

```bash
gh issue comment <N> -R admiterepoli-com/website_poli --body "🤖 RELEASED — <what you found, what is left, why you stopped>"
gh issue edit <N> -R admiterepoli-com/website_poli --remove-assignee @me --remove-label in-progress
```

If the blocker needs a secret, a repository setting or a decision that affects SEO, also add the `needs-human` label.

## Final report

End with: the issue number and title, the PR link, which checks passed, and anything you noticed that deserves a new issue.
