import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { MOCK_JOBS } from "@/data/mockJobs";
import type { Job } from "@/types/job";
import { JobsBrowser } from "./jobs-browser";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Live Jobs Across the Gulf",
  description:
    "Browse live job openings across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and Egypt. Filter by city, category, experience level, and work type.",
  alternates: { canonical: "/jobs" },
};

function getMigrationJobs(): Job[] {
  try {
    const file = join(process.cwd(), "data", "migration-jobs.json");
    return JSON.parse(readFileSync(file, "utf8")) as Job[];
  } catch {
    return [];
  }
}

function normalizeMockJob(j: (typeof MOCK_JOBS)[number]): Job {
  return {
    ...j,
    is_filled: false,
    slug: j.slug ?? j.id,
    source: "admin" as const,
  };
}

async function getLiveJobs(): Promise<Job[]> {
  try {
    const { createPublicClient } = await import("@/lib/supabase/server");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("approved", true)
      .eq("is_filled", false)
      // Not expired = no expiry set at all, or expiry in the future.
      // `expires_at.gt.<now>` alone would silently drop every NULL row,
      // since SQL NULL > x is never true.
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false });
    if (!error && data && data.length > 0) return data as Job[];
  } catch {
    // fall through
  }
  // JSON + mock fallback — these have no approved/expires_at columns at all,
  // so (like the [slug] page's fallback) they're not subject to that gate.
  return [...getMigrationJobs(), ...MOCK_JOBS.map(normalizeMockJob)];
}

export default async function JobsPage() {
  const jobs = await getLiveJobs();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobs.map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://addify.ae/jobs/${job.slug ?? job.id}`,
    })),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-14 md:py-20">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Open Roles</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Live jobs across the Gulf</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Hand-picked openings from real employers. Updated weekly.
            </p>
          </Container>
        </section>

        <Container className="py-8 md:py-12">
          <JobsBrowser jobs={jobs} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
