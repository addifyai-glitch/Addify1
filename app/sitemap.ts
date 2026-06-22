import type { MetadataRoute } from "next";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROLE_SLUGS, CITY_SLUGS } from "@/lib/salary";

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
    { url: `${SITE}/fit`,               lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/cover-letter`,      lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/tools/resume-builder`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
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
    { url: `${SITE}/research`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Job pages — try Supabase first, fall back to migration JSON
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("jobs")
      .select("slug, modified_at, posted_at")
      .eq("approved", true)
      .eq("is_filled", false);

    if (data && data.length > 0) {
      jobRoutes = data.map((j) => ({
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
    jobRoutes = jobs.map((j) => ({
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

  // Salary tool pages
  const salaryRoutes: MetadataRoute.Sitemap = ROLE_SLUGS.flatMap((jobSlug) =>
    CITY_SLUGS.map((citySlug) => ({
      url: `${SITE}/salary/${jobSlug}/${citySlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...jobRoutes, ...blogRoutes, ...salaryRoutes];
}
