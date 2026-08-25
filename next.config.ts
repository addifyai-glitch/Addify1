import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  outputFileTracingIncludes: {
    "/api/tools/resume-builder/pdf": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "tghiorlbfhpqitrtujtv.supabase.co" },
    ],
  },

  async redirects() {
    return [
      // Canonicalize www -> apex. Host-level redirect so it applies to every
      // path, checked first since it's identity canonicalization, not
      // content routing. Note: as of 2026-08-12, www.addify.ae returns a
      // Cloudflare-edge 503 ("no available server") and never reaches this
      // Next.js app at all — that's a DNS/Cloudflare origin-binding issue,
      // not something this redirect can fix on its own. This rule exists so
      // that once www is correctly routed to the origin at the Cloudflare
      // level, it lands here and gets canonicalized instead of serving
      // duplicate content.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.addify.ae" }],
        destination: "https://addify.ae/:path*",
        permanent: true,
      },
      // Legacy WordPress candidate profiles (real individuals' names + CV
      // links), including the CV PDFs themselves under
      // /wp-content/uploads/jobsearch-resumes/, are handled directly in
      // proxy.ts as a same-URL 410, not a redirect — see the note there on
      // why direct beats a redirect hop for a privacy takedown.
      // 3 high-traffic slugs that no longer exist in WP data. Must come
      // BEFORE the generic /job/:slug rule below: Next.js redirects() takes
      // the first match, and /job/:slug is a wildcard that would otherwise
      // shadow these every time, sending them to a /jobs/:slug that doesn't
      // exist (404) instead of this category-filtered fallback. Found via
      // scripts/check-legacy-urls.sh during the legacy-redirect-map fix.
      {
        source: "/job/custom-and-excise-tax-manager",
        destination: "/jobs?category=Finance+%26+Accounting",
        permanent: true,
      },
      {
        source: "/job/purchasing-assistant-dubai",
        destination: "/jobs?category=Operations+%26+Supply+Chain&city=Dubai",
        permanent: true,
      },
      {
        source: "/job/it-support-engineer-7",
        destination: "/jobs?category=Technology+%26+Engineering",
        permanent: true,
      },
      // Old WordPress job URLs: preserve slug, route to new structure.
      // The trailing-slash entry below is dead code, confirmed by testing:
      // Next's own trailing-slash normalization strips the slash before this
      // redirects() list is ever consulted, so a slashed request always
      // arrives here already normalized. Left in place rather than removed
      // since it's harmless and not part of the task that found this.
      {
        source: "/job/:slug",
        destination: "/jobs/:slug",
        permanent: true,
      },
      {
        source: "/job/:slug/",
        destination: "/jobs/:slug",
        permanent: true,
      },
      // WordPress jobs index trailing slash
      {
        source: "/jobs/",
        destination: "/jobs",
        permanent: true,
      },
      // Old sector/category pages
      {
        source: "/sector/:cat",
        destination: "/jobs",
        permanent: true,
      },
      {
        source: "/job-sector/:cat",
        destination: "/jobs",
        permanent: true,
      },
      // Resume builder — old URL to new canonical URL
      {
        source: '/tools/resume',
        destination: '/tools/resume-builder',
        permanent: true,
      },
      // Gratuity calculator — old standalone HTML file to new Next.js page
      {
        source: '/tools/uae-gratuity-calculator.html',
        destination: '/tools/gratuity-calculator',
        permanent: true,
      },
      {
        source: '/tools/uae-gratuity-calculator',
        destination: '/tools/gratuity-calculator',
        permanent: true,
      },
      // WordPress admin and login
      {
        source: "/wp-admin/:path*",
        destination: "/admin/login",
        permanent: true,
      },
      {
        source: "/wp-login.php",
        destination: "/admin/login",
        permanent: true,
      },
      // Author pages
      {
        source: "/author/:author",
        destination: "/about",
        permanent: true,
      },
      // Tag archives
      {
        source: "/tag/:tag",
        destination: "/blog",
        permanent: true,
      },
      // Old user dashboard (jobsearch plugin)
      {
        source: "/user-dashboard/:path*",
        destination: "/admin/login",
        permanent: true,
      },
      // Old jobsearch plugin paths
      {
        source: "/jobs-page/:path*",
        destination: "/jobs",
        permanent: true,
      },
      // Date archives
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug",
        destination: "/blog",
        permanent: true,
      },
      // Old jobsearch plugin login/registration — no equivalent on the new
      // site, send to the homepage rather than a dead end. No trailing-slash
      // duplicate needed: Next's own trailing-slash normalization strips the
      // slash before this redirects() list is ever consulted, so a slashed
      // request always arrives here already normalized (see the note on
      // /job/:slug/ above — that duplicate is dead for the same reason).
      {
        source: "/user-login",
        destination: "/",
        permanent: true,
      },
      // WordPress pagination (e.g. /page/2/, often with a ?detail=... query
      // string from the old jobsearch listing plugin — the query string
      // passes through untouched since it's not part of the match).
      {
        source: "/page/:n(\\d+)",
        destination: "/blog",
        permanent: true,
      },
      // Duplicate salary report content removed from blog_posts in favor of
      // /research, which is now canonical for these three reports. The old
      // /blog/<slug> URLs are indexed — redirect, don't leave them 404ing.
      {
        source: "/blog/uae-salary-report-2026-salaries-hiring-trends-and-what-professionals-need-to-know",
        destination: "/research/uae-salary-report-2026",
        permanent: true,
      },
      {
        source: "/blog/saudi-arabia-salary-report-2026-and-gcc-hiring-trends",
        destination: "/research/saudi-arabia-salary-report-2026",
        permanent: true,
      },
      {
        source: "/blog/dubai-tech-salary-report-2026-what-software-engineers-ai-experts-and-tech-leaders-are-really-earning",
        destination: "/research/dubai-tech-salary-report-2026",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
