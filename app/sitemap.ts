import type { MetadataRoute } from "next";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROLE_SLUGS, CITY_SLUGS } from "@/lib/salary";
import { getCategorySummaries } from "@/lib/blog-categories";
import { isStaleJob } from "@/lib/job-freshness";

const SITE = "https://addify.ae";

function getMigrationSlugs(): { slug: string; posted_at: string; modified_at?: string | null }[] {
  try {
    const file = join(process.cwd(), "data", "migration-jobs.json");
    const jobs = JSON.parse(readFileSync(file, "utf8"));
    return jobs.map((j: { slug: string; posted_at: string; modified_at?: string | null }) => ({
      slug: j.slug,
      posted_at: j.posted_at,
      modified_at: j.modified_at,
    }));
  } catch {
    return [];
  }
}

async function getBlogSlugs(): Promise<{ slug: string; date: string }[]> {
  const fileSlugs: { slug: string; date: string }[] = [];
  try {
    const blogDir = join(process.cwd(), "content", "blog");
    readdirSync(blogDir)
      .filter((f) => f.endsWith(".mdx"))
      .forEach((f) => {
        const slug = f.replace(/\.mdx$/, "");
        const content = readFileSync(join(blogDir, f), "utf8");
        const match = content.match(/^date:\s*"?([^"\n]+)"?/m);
        fileSlugs.push({ slug, date: match?.[1] ?? new Date().toISOString() });
      });
  } catch { /* no MDX dir */ }

  const dbSlugs: { slug: string; date: string }[] = [];
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, date")
      .eq("draft", false);

    const fileSlugSet = new Set(fileSlugs.map((p) => p.slug));
    (data ?? [])
      .filter((row) => !fileSlugSet.has(row.slug))
      .forEach((row) => dbSlugs.push({ slug: row.slug, date: row.date }));
  } catch { /* Supabase unavailable */ }

  return [...fileSlugs, ...dbSlugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE,                        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE}/jobs`,              lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE}/salary`,            lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/cover-letter`,      lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/tools`,              lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE}/tools/resume-builder`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/tools/gratuity-calculator`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/blog`,              lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/contact`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/submit-job`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/methodology`,       lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/data-sources`,     lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/about-our-data`,   lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/editorial-policy`, lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE}/research`,                              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/research/uae-salary-report-2026`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/research/saudi-arabia-salary-report-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/research/dubai-tech-salary-report-2026`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Job pages — try Supabase first, fall back to migration JSON
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("jobs")
      .select("slug, modified_at, posted_at")
      .eq("approved", true)
      .eq("is_filled", false)
      // Not expired = no expiry set at all, or expiry in the future.
      // `expires_at.gt.<now>` alone would silently drop every NULL row,
      // since SQL NULL > x is never true.
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (data && data.length > 0) {
      jobRoutes = data
        .filter((j) => !isStaleJob(j.posted_at))
        .map((j) => ({
          url: `${SITE}/jobs/${j.slug}`,
          lastModified: new Date(j.modified_at ?? j.posted_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch {
    // fall through to JSON
  }

  if (jobRoutes.length === 0) {
    const jobs = getMigrationSlugs();
    jobRoutes = jobs
      .filter((j) => !isStaleJob(j.posted_at))
      .map((j) => ({
        url: `${SITE}/jobs/${j.slug}`,
        lastModified: new Date(j.modified_at ?? j.posted_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  }

  // Blog pages
  const blogRoutes: MetadataRoute.Sitemap = (await getBlogSlugs()).map(({ slug, date }) => ({
    url: `${SITE}/blog/${slug}`,
    lastModified: new Date(date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog category archives
  const blogCategoryRoutes: MetadataRoute.Sitemap = (await getCategorySummaries()).map((c) => ({
    url: `${SITE}/blog/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Salary tool pages
  const salaryRoutes: MetadataRoute.Sitemap = ROLE_SLUGS.flatMap((jobSlug) =>
    CITY_SLUGS.map((citySlug) => ({
      url: `${SITE}/salary/${jobSlug}/${citySlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  // Salary comparison pages
  let compareRoutes: MetadataRoute.Sitemap = [];
  try {
    const { getComparisonPaths } = await import("@/lib/comparison");
    const paths = await getComparisonPaths();
    compareRoutes = [
      { url: `${SITE}/salary/compare`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
      ...paths.map(({ comparison }) => ({
        url: `${SITE}/salary/compare/${comparison}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch { /* comparison lib unavailable */ }

  return [...staticRoutes, ...jobRoutes, ...blogRoutes, ...blogCategoryRoutes, ...salaryRoutes, ...compareRoutes];
}
