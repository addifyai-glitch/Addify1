# Addify Migration Runbook

This is the operational playbook. Each phase has user actions, Claude actions, and STOP checkpoints.

---

## Phase 1: Parallel deployment (this week)

**Goal:** New site live at addify-new.vercel.app. Old WordPress untouched.

### User actions (do these before invoking Claude Code)

1. **Create a GitHub account** if you do not have one at https://github.com/signup
2. **Create a Vercel account** at https://vercel.com/signup using your GitHub login
3. **Create a Supabase project** at https://supabase.com
   - Project name: `addify`
   - Region: `Frankfurt` (closest to UAE) or `Mumbai`
   - Save the database password somewhere safe
   - From Settings > API, copy: Project URL, anon public key, service_role key (keep service_role secret)
4. **Create reCAPTCHA v3 keys** at https://www.google.com/recaptcha/admin/create
   - Type: reCAPTCHA v3
   - Domains: `addify.ae`, `addify-new.vercel.app`, `localhost`
   - Save the site key and secret key

### Claude Code actions (paste this prompt when ready)

Paste the file `prompts/phase-1-deploy.md` (generated separately) into Claude Code. It will:
- Initialize git in the project
- Push to a new GitHub repo called `addify`
- Set up environment variable structure
- Walk you through Vercel deployment
- Run the Supabase schema migration
- Verify the deployment

### Phase 1 completion criteria

- [ ] addify-new.vercel.app loads the homepage
- [ ] All public pages return 200
- [ ] Theme toggle works
- [ ] Forms render (do not need to be wired to Supabase yet for Phase 1 sign-off, but recommended)
- [ ] You can log in at /admin/login and access the admin

**Time estimate:** 2 to 3 hours of focused work, mostly waiting for deployments.

---

## Phase 2: Content migration (next week)

**Goal:** 20 high-traffic job slugs migrated to new site. AdSense ad codes wired in. Redirect map ready.

### User actions

1. **Export WordPress content** (Tools > Export > All content > Download XML)
2. **Copy AdSense ad unit codes** from AdSense Console > Ads > By ad unit
3. **Copy your AdSense Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. **Decide which of the 20 jobs to keep active**

### Phase 2 completion criteria

- [ ] All 20 migrated jobs accessible at /jobs/[slug]
- [ ] /job/[slug] redirects to /jobs/[slug] with 301
- [ ] /wp-content/uploads/jobsearch-resumes/* returns 410
- [ ] AdSense ads visible on a test page (in staging)
- [ ] sitemap.xml includes the 20 migrated URLs

---

## Phase 3: Cutover (week 3 or 4)

**Goal:** addify.ae now serves the new Next.js site. AdSense continues. Old WordPress retired.

### Phase 3 completion criteria

- [ ] addify.ae serves the new Next.js site
- [ ] Top 6 job URLs all return 200 with content
- [ ] /job/[slug] redirects to /jobs/[slug]
- [ ] /wp-content/uploads/jobsearch-resumes/* returns 410
- [ ] AdSense console shows ads serving on new pages within 24 hours
- [ ] Search Console shows the new sitemap accepted
