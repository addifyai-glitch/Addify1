import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async redirects() {
    return [
      // CV PDFs: privacy leak — send to 410
      {
        source: "/wp-content/uploads/jobsearch-resumes/:path*",
        destination: "/410",
        permanent: true,
      },
      // Old WordPress job URLs: preserve slug
      {
        source: "/job/:slug",
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
      // WordPress admin
      {
        source: "/wp-admin/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/wp-login.php",
        destination: "/",
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
