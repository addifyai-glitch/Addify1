This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Content Workflow

Blog posts and other content changes must go through a pull request, not a
direct commit to `main` — including edits made via the GitHub web editor. A
malformed content file committed directly to `main` bypasses CI entirely and
can break every production deploy until someone notices and fixes it.

The `Validate` workflow (`.github/workflows/validate.yml`) runs content
validation and a full build on every pull request and on every push to
`main`. It only catches a bad file automatically if the branch protection
rule below is enabled — otherwise it just reports the failure after the fact.

**To enable it** (requires repo admin access):

1. Go to the repository on GitHub → **Settings** → **Branches** (left
   sidebar, under "Code and automation").
2. Under "Branch protection rules", click **Add branch protection rule**
   (or **Add rule**).
3. Branch name pattern: `main`.
4. Check **Require a pull request before merging**.
5. Check **Require status checks to pass before merging**, then search for
   and select the `validate` check (from the Validate workflow — it will
   only appear in the list after the workflow has run at least once).
6. Save changes.

With this enabled, nothing — including a change made directly in the GitHub
web UI — can reach `main` without passing content validation and a
successful build first.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
