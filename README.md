# Addify

Source for [addify.ae](https://addify.ae) — GCC salary and career intelligence:
salary pages, free calculators, jobs and a blog. Next.js 16 + Supabase, deployed
with Coolify on Hetzner behind Cloudflare.

Project rules for humans and Claude live in [`CLAUDE.md`](CLAUDE.md).

## Local development

```bash
cp .env.example .env.local   # fill in values
npm ci
npm run dev                  # http://localhost:3000
```

| Check | Command |
| --- | --- |
| Type check | `npm run typecheck` |
| Lint a file | `npx eslint <file>` |
| Blog content | `node scripts/validate-content.mjs` |
| Production build | `npm run build` |
| E2E tests (after a build) | `npm run test:e2e` |
| E2E against a deployed URL | `BASE_URL=https://addify.ae npm run test:e2e` |
| Lighthouse budgets (after a build) | `npm run test:lighthouse` |

First E2E run on a new machine: `npx playwright install chromium`.

## How changes reach production

1. Every change — code or blog post, including edits in the GitHub web editor —
   goes on a branch and through a pull request.
2. The `Validate` workflow runs on the PR: `validate` (content + build),
   `typecheck`, `lint-changed`, `e2e` (Playwright), `lighthouse` (SEO and
   accessibility budgets), `secrets` and `audit`. `Claude review` leaves
   advisory comments.
3. The founder merges. Merging to `main` triggers the Coolify deploy.

## Branch protection (one-time setup, repo admin)

GitHub → **Settings → Rules → Rulesets → New branch ruleset** (or **Branches →
Add rule** on older UIs):

1. Target: the default branch (`main`). Enforcement: **Active**.
2. Enable **Restrict deletions** and **Block force pushes**.
3. Enable **Require a pull request before merging**. Set required approvals to
   **0** — on a solo repo GitHub doesn't let you approve your own PR; the merge
   click is the human gate.
4. Enable **Require status checks to pass**, tick **Require branches to be up to
   date**, and add: `validate`, `typecheck`, `lint-changed`, `e2e`,
   `lighthouse`, `secrets`, `audit`. (Checks
   appear in the picker after the workflow has run once — open this PR first.)
5. Leave the bypass list empty so the rule applies to admins too.

## Claude Code guardrails

`.claude/settings.json` registers hooks in `.claude/hooks/`:

| Hook | When | What it does |
| --- | --- | --- |
| `guard-bash.mjs` | Before any shell command | Blocks pushes/commits on `main`, force-push, `gh pr merge`, reading `.env`, dumping env vars, destructive git/SQL, Supabase resets, infra CLIs, and `rm -r` outside build folders |
| `protect-files.mjs` | Before any file edit | Blocks `.env*`/keys always; blocks committed migrations, workflows, `.claude/*`, `CLAUDE.md` and the lockfile unless the session was started with `ADDIFY_ALLOW_PROTECTED=1` |
| `post-edit-check.mjs` | After any file edit | ESLint on the edited file; blog MDX validation for `content/blog/*` |
| `stop-typecheck.mjs` | When Claude tries to finish | Runs `tsc --noEmit` if TypeScript changed; Claude can't stop with type errors |

Hooks are plain Node scripts, so they need only Node 22 — no `jq`.

## Claude in GitHub

- `@claude` in an issue or PR comment: Claude works on a branch and opens or
  updates a PR (`.github/workflows/claude.yml`). It never merges.
- Every non-draft PR gets an advisory Claude code review
  (`.github/workflows/claude-review.yml`).
- Both need the `CLAUDE_CODE_OAUTH_TOKEN` repo secret (create it locally with
  `claude setup-token`; runs on the Claude subscription, no API billing).
  Without the secret both workflows skip. Runs are capped with `--max-turns`.

## Health check and rollback

- `GET /api/health` returns `{"status":"ok"}`. In Coolify → the app →
  **Configuration → Health Checks**: path `/api/health`, port `80` (the port
  the container listens on; check the deploy log line "Local: http://localhost:…"). A deploy that
  fails the check never replaces the running container.
- To roll back: revert the merge commit on GitHub (**Revert** button on the PR),
  merge the revert PR, Coolify redeploys. Or in Coolify → **Deployments**, redeploy
  the previous successful deployment.
