import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "tghiorlbfhpqitrtujtv.supabase.co" },
    ],
  },

  async redirects() {
    return [
      // CV PDFs: privacy — send to 410 Gone handler
      {
        source: "/wp-content/uploads/jobsearch-resumes/:path*",
        destination: "/410?reason=privacy",
        permanent: true,
      },
      // Old WordPress job URLs: preserve slug, route to new structure
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
      // 3 high-traffic slugs that no longer exist in WP data
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
    ];
  },
};

export default nextConfig;
