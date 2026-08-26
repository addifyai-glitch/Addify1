#!/usr/bin/env bash
# Checks HTTP status codes for legacy URL patterns that must redirect or 410,
# never bare 404. Run after deploy to confirm the fix landed.
#
# Usage: scripts/check-legacy-urls.sh [base_url]
# Defaults to https://addify.ae; pass a different base to test staging/local.

set -euo pipefail

BASE_URL="${1:-https://addify.ae}"

# path|expected_status|note
CHECKS=(
  # Privacy takedowns (proxy.ts, direct 410, no redirect hop)
  "/candidate/nada-alisia/|410|Legacy candidate profile, privacy takedown"
  "/candidate/some-other-person/|410|Legacy candidate profile, privacy takedown"
  "/wp-content/uploads/jobsearch-resumes/some-file.pdf|410|Legacy CV PDF, privacy takedown"

  # Inherited spam (proxy.ts LEGACY_SPAM_PATTERNS / LEGACY_SPAM_EXACT)
  "/when-do-sassa-grants-get-paid/|410|Legacy spam, inherited from previous domain owner"
  "/when-is-the-next-sassa-payment-for-2021/|410|Legacy spam, inherited from previous domain owner"
  "/rbtv77-web/|410|Legacy spam, inherited from previous domain owner"

  # Removed salary submission feature (proxy.ts, direct 410)
  "/contribute|410|Salary submission feature, removed entirely"

  # Removed Fit Score feature (proxy.ts, direct 410, page + its API route)
  "/fit|410|Fit Score feature, removed entirely"
  "/api/tools/fit-score|410|Fit Score API route, removed entirely"

  # Legacy WordPress /wp-content/* catch-all (proxy.ts, direct 410)
  "/wp-content/anything|410|Legacy WP wp-content path, deliberately removed"
  "/wp-content/themes/old-theme/style.css|410|Legacy WP theme asset, deliberately removed"

  # Legacy WordPress passive-income article at /uae/ (proxy.ts, direct 410)
  "/uae|410|Legacy WP passive-income article, deliberately removed"

  # Former WordPress employer profile pages (proxy.ts LEGACY_EMPLOYER_PREFIX)
  "/employer/kingston-stanley/|410|Legacy employer page, deliberately removed"
  "/employer/deepscale-technologies-ltd/|410|Legacy employer page, deliberately removed"
  "/employer/star-services-llc/|410|Legacy employer page, deliberately removed"
  "/employer/reliance-recruiters/|410|Legacy employer page, deliberately removed"
  "/employer/tosanoides-inc/|410|Legacy employer page, deliberately removed"
  "/employer/actief-jobmade/|410|Legacy employer page, deliberately removed"
  "/employer/sse-global-tech/|410|Legacy employer page, deliberately removed"
  "/employer/mcgregor-recruitments-llc/|410|Legacy employer page, deliberately removed"
  "/employer/al-sahraa-recruitment-services/|410|Legacy employer page, deliberately removed"
  "/employer/addify-recruitment-2-2/|410|Legacy employer page, deliberately removed"

  # Old WordPress job URLs -> new job structure (next.config.ts)
  "/job/prepress-operator|200|Old WP job URL, redirects to /jobs/:slug (slug currently live)"
  "/job/custom-and-excise-tax-manager|200|High-traffic slug with no WP-data equivalent, redirects to category filter"
  "/job/purchasing-assistant-dubai|200|High-traffic slug with no WP-data equivalent, redirects to category filter"
  "/job/it-support-engineer-7|200|High-traffic slug with no WP-data equivalent, redirects to category filter"

  # Old sector/category pages -> /jobs (next.config.ts)
  "/sector/finance|200|Old WP sector page, redirects to /jobs"
  "/job-sector/finance|200|Old WP job-sector page, redirects to /jobs"

  # Old tool URLs -> new canonical URLs (next.config.ts)
  "/tools/resume|200|Old resume tool URL, redirects to /tools/resume-builder"
  "/tools/uae-gratuity-calculator.html|200|Old standalone HTML calculator, redirects to /tools/gratuity-calculator"
  "/tools/uae-gratuity-calculator|200|Old calculator URL, redirects to /tools/gratuity-calculator"

  # WordPress admin/login -> /admin/login (next.config.ts)
  "/wp-admin/edit.php|200|Old WP admin URL, redirects to /admin/login"
  "/wp-login.php|200|Old WP login URL, redirects to /admin/login"

  # Old jobsearch plugin dashboard -> /admin/login (next.config.ts) — NOT /,
  # kept deliberately: a stray real user here is more likely trying to log in
  "/user-dashboard/profile|200|Old jobsearch dashboard, redirects to /admin/login (not /)"

  # Old jobsearch plugin login/registration -> homepage (next.config.ts)
  "/user-login|200|Old jobsearch login URL, no equivalent, redirects to /"
  "/user-login/|200|Old jobsearch login URL (indexed slashed form), redirects to /"

  # Author and tag archives -> /about, /blog (next.config.ts)
  "/author/admin|200|Old WP author archive, redirects to /about"
  "/tag/dubai-jobs|200|Old WP tag archive, redirects to /blog"

  # Old jobsearch plugin listing paths -> /jobs (next.config.ts)
  "/jobs-page/2|200|Old jobsearch plugin listing path, redirects to /jobs"

  # WordPress pagination -> /blog (next.config.ts)
  "/page/2|200|WP pagination, redirects to /blog"
  "/page/2/|200|WP pagination (indexed slashed form), redirects to /blog"

  # WordPress date archives -> /blog (next.config.ts)
  "/2021/05/some-old-post|200|Old WP date archive, redirects to /blog"

  # Duplicate salary reports removed from blog_posts, /research is canonical (next.config.ts)
  "/blog/uae-salary-report-2026-salaries-hiring-trends-and-what-professionals-need-to-know|200|Removed duplicate, redirects to /research/uae-salary-report-2026"
  "/blog/saudi-arabia-salary-report-2026-and-gcc-hiring-trends|200|Removed duplicate, redirects to /research/saudi-arabia-salary-report-2026"
  "/blog/dubai-tech-salary-report-2026-what-software-engineers-ai-experts-and-tech-leaders-are-really-earning|200|Removed duplicate, redirects to /research/dubai-tech-salary-report-2026"

  # Off-topic blog post removed, no equivalent destination (proxy.ts)
  "/blog/start-earning-free-rewards-with-microsoft-rewards-no-cost-just-daily-browsing|410|Off-topic post, deliberately removed"
)

fail=0

printf "%-55s %-8s %-8s %s\n" "PATH" "WANT" "GOT" "NOTE"
for check in "${CHECKS[@]}"; do
  IFS='|' read -r path expected note <<< "$check"
  url="${BASE_URL}${path}"
  # Follow redirects — we want the FINAL status a crawler would see, since a
  # 301/308 into the 410 handler is the expected, correct path here.
  got=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "ERR")

  status_ok="no"
  if [ "$got" = "$expected" ]; then
    status_ok="yes"
  fi

  printf "%-55s %-8s %-8s %s\n" "$path" "$expected" "$got" "$note"

  if [ "$status_ok" = "no" ]; then
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "FAIL: one or more legacy URLs did not return the expected status."
  exit 1
fi

echo ""
echo "OK: all legacy URLs returned their expected status."
