import type { MetadataRoute } from "next";
import { readdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { ROLE_SLUGS, CITY_SLUGS } from "@/lib/salary";
import { getCategorySummaries, getPostsByCategorySlug } from "@/lib/blog-categories";

const SITE = "https://addify.ae";

// Real last-commit date for a source file, not build/request time — Perplexity
// and other engines weight freshness signals, so a lastmod that's always
// "now" is worse than no signal at all. Falls back to `fallback` (unchanged
// prior behavior) if git history isn't available in the build environment.
const gitDateCache = new Map<string, Date>();
function gitLastModified(relPath: string, fallback: Date): Date {
  if (gitDateCache.has(relPath)) return gitDateCache.get(relPath)!;
  let result = fallback;
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (iso) result = new Date(iso);
  } catch {
    // no .git in this build environment — keep fallback
  }
  gitDateCache.set(relPath, result);
  return result;
}

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

  // Homepage and /jobs are genuinely daily-changing aggregators (live job
  // counts, rotating content) — `now` is an honest signal there. Everything
  // else below gets the real last-commit date of its source file.
  const researchFile = "app/research/[slug]/page.tsx";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE,                        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE}/jobs`,              lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE}/salary`,            lastModified: gitLastModified("app/(tools)/salary/page.tsx", now), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/cover-letter`,      lastModified: gitLastModified("app/cover-letter/page.tsx", now), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/tools`,              lastModified: gitLastModified("app/tools/page.tsx", now), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE}/tools/resume-builder`, lastModified: gitLastModified("app/tools/resume-builder/page.tsx", now), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/tools/gratuity-calculator`, lastModified: gitLastModified("app/tools/gratuity-calculator/page.tsx", now), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/blog`,              lastModified: gitLastModified("app/blog/page.tsx", now), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/about`,             lastModified: gitLastModified("app/about/page.tsx", now), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/contact`,           lastModified: gitLastModified("app/contact/page.tsx", now), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy`,           lastModified: gitLastModified("app/privacy/page.tsx", now), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,             lastModified: gitLastModified("app/terms/page.tsx", now), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/submit-job`,        lastModified: gitLastModified("app/submit-job/page.tsx", now), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/methodology`,       lastModified: gitLastModified("app/methodology/page.tsx", now), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/data-sources`,     lastModified: gitLastModified("app/data-sources/page.tsx", now), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/about-our-data`,   lastModified: gitLastModified("app/about-our-data/page.tsx", now), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/editorial-policy`, lastModified: gitLastModified("app/editorial-policy/page.tsx", now), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE}/research`,                              lastModified: gitLastModified("app/research/page.tsx", now), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/research/uae-salary-report-2026`,       lastModified: gitLastModified(researchFile, now), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/research/saudi-arabia-salary-report-2026`, lastModified: gitLastModified(researchFile, now), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/research/dubai-tech-salary-report-2026`,   lastModified: gitLastModified(researchFile, now), changeFrequency: "monthly", priority: 0.7 },
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

  // Blog category archives — real signal: the newest post actually in that
  // category, not the moment the sitemap happened to regenerate.
  const blogCategoryRoutes: MetadataRoute.Sitemap = await Promise.all(
    (await getCategorySummaries()).map(async (c) => {
      const group = await getPostsByCategorySlug(c.slug);
      const newest = group?.posts.reduce<Date | null>((max, p) => {
        const d = new Date(p.date);
        return !max || d > max ? d : max;
      }, null);
      return {
        url: `${SITE}/blog/category/${c.slug}`,
        lastModified: newest ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      };
    })
  );

  // Salary tool pages — all 225 are generated from the same data/salaries.json
  // snapshot, so its last-commit date is the real "as of" signal, shared
  // across the whole set rather than a per-request `now`.
  const salaryDataDate = gitLastModified("data/salaries.json", now);
  const salaryRoutes: MetadataRoute.Sitemap = ROLE_SLUGS.flatMap((jobSlug) =>
    CITY_SLUGS.map((citySlug) => ({
      url: `${SITE}/salary/${jobSlug}/${citySlug}`,
      lastModified: salaryDataDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  // Salary comparison pages — same underlying salary data.
  let compareRoutes: MetadataRoute.Sitemap = [];
  try {
    const { getComparisonPaths } = await import("@/lib/comparison");
    const paths = await getComparisonPaths();
    compareRoutes = [
      { url: `${SITE}/salary/compare`, lastModified: salaryDataDate, changeFrequency: "monthly" as const, priority: 0.6 },
      ...paths.map(({ comparison }) => ({
        url: `${SITE}/salary/compare/${comparison}`,
        lastModified: salaryDataDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch { /* comparison lib unavailable */ }

  return [...staticRoutes, ...jobRoutes, ...blogRoutes, ...blogCategoryRoutes, ...salaryRoutes, ...compareRoutes];
}
