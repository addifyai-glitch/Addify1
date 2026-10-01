@AGENTS.md

# Addify — project rules for Claude

Addify (addify.ae) is a GCC salary and career intelligence site: salary pages,
free calculators (gratuity, resume builder, …), jobs and a blog. Audience:
professionals in UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman and Egypt.

## Stack

- Next.js 16 (App Router, `proxy.ts` instead of middleware) + React 19 + Tailwind 4
- Supabase (Postgres + auth) — `lib/supabase/`, migrations in `supabase/migrations/`
- Resend for email, reCAPTCHA v3 on public forms, AdSense
- Hosting: Coolify on a Hetzner VPS behind Cloudflare. A merge to `main` deploys to
  production through the Coolify webhook. There is no staging server yet.
- Blog posts: MDX in `content/blog/`, validated by `scripts/validate-content.mjs`

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint one file | `npx eslint <file>` |
| Validate blog content | `node scripts/validate-content.mjs` |
| Production build | `npm run build` |
| E2E tests (after build) | `npm run test:e2e` |
| Lighthouse budgets (after build) | `npm run test:lighthouse` |

`npx eslint .` currently reports pre-existing errors. Do not mass-fix them as a side
effect of another task; CI lints only the files a PR changes, so leave every file you
touch lint-clean.

## How work flows (never skip a step)

1. Work on a branch: `feat/*`, `fix/*`, `content/*`, `chore/*`. Never commit or push
   to `main`. Never force-push.
2. One concern per PR. Keep diffs small enough to review on a phone.
3. Open a pull request; the `Validate` workflow must be green.
4. The founder reviews and merges. Merging is the production deploy.

## Definition of done

- `npm run typecheck` passes and every changed file is lint-clean.
- `npm run build` passes (it runs content validation first).
- `npm run test:e2e` passes. A new page template gets a row in
  `tests/e2e/helpers.ts` (KEY_PAGES); a new tool or form gets a spec in
  `tests/e2e/` that exercises it like a user would.
- Any form or API route you add or change is proven end-to-end: the request is made
  and the row/email is confirmed, not assumed. (A form once discarded every
  submission for months because nobody checked.)
- New public pages: unique title + meta description, canonical URL, JSON-LD where
  relevant, and an entry in `app/sitemap.ts`.
- No new console errors. Mobile layout checked.
- The PR description says what changed, why, and how it was verified.

## Data and honesty rules (hard rules)

- Never invent numbers, salaries, sample sizes, testimonials, reviews, quotes or
  citations. Every public figure must come from a Supabase query or a linked source.
- Keep the data-gating: pages that show salary data render only above the minimum
  sample threshold. Never lower a threshold to make a page appear.
- If data is missing, say so in the UI or skip the page. Never fill it with
  placeholders that look real.

## Security rules (hard rules)

- Never read, print, edit or commit `.env*` files or secrets. Use `.env.example` to
  learn variable names.
- No unauthenticated endpoint may call an LLM or send email to arbitrary addresses.
  Every public POST route needs rate limiting (`lib/rate-limit.ts`) and bot checks.
- Use the Supabase service-role key only in server code, never in client components.
- Do not edit `.github/workflows/*`, `.claude/*`, `CLAUDE.md` or applied migrations
  unless the task is explicitly about them; propose the change in the PR instead.

## Removed features — keep them removed

`/contribute`, `/fit` (+ `/api/tools/fit-score`) and the old cover-letter AI endpoint
were removed on purpose and return 410 from `proxy.ts`. Do not reintroduce them.

## Attribution

Commits are authored as `Addify <hi@addify.ae>`. Never use a personal name in
commits, bylines or page copy.
