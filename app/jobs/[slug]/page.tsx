import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ui/ad-slot";
import { MapPin, Briefcase, Clock, ChevronRight, ArrowUpRight, GraduationCap, CalendarDays } from "lucide-react";
import type { Job } from "@/types/job";

export const revalidate = 3600;

// ── Data fetching ────────────────────────────────────────────────────────────

function getMigrationJobs(): Job[] {
  const file = join(process.cwd(), "data", "migration-jobs.json");
  return JSON.parse(readFileSync(file, "utf8")) as Job[];
}

async function getJob(slug: string): Promise<Job | null> {
  try {
    const { createPublicClient } = await import("@/lib/supabase/server");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .single();
    if (!error && data) return data as Job;
  } catch {
    // fall through
  }
  // JSON fallback
  const jobs = getMigrationJobs();
  return jobs.find((j) => j.slug === slug) ?? null;
}

async function getSimilarJobs(category: string, excludeSlug: string): Promise<Job[]> {
  try {
    const { createPublicClient } = await import("@/lib/supabase/server");
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("jobs")
      .select("id, slug, title, company, city, country, category, salary_min, salary_max, currency, is_featured, posted_at, apply_url, experience_level")
      .eq("approved", true)
      .eq("is_filled", false)
      .eq("category", category)
      .neq("slug", excludeSlug)
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(4);
    if (data && data.length > 0) return data as Job[];
  } catch {
    // fall through
  }
  const jobs = getMigrationJobs();
  return jobs
    .filter((j) => j.category === category && j.slug !== excludeSlug)
    .slice(0, 4);
}

// ── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const { createPublicClient } = await import("@/lib/supabase/server");
    const supabase = createPublicClient();
    const { data } = await supabase.from("jobs").select("slug").eq("approved", true);
    if (data && data.length > 0) {
      return data.map((j) => ({ slug: j.slug as string }));
    }
  } catch {
    // fall through
  }
  const jobs = getMigrationJobs();
  return jobs.map((j) => ({ slug: j.slug as string }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Job not found | Addify" };

  const description = (job.description ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: `${job.title} in ${job.city} | Addify`,
    description,
    alternates: {
      canonical: `https://addify.ae/jobs/${slug}`,
    },
    openGraph: {
      title: `${job.title} in ${job.city}`,
      description,
      url: `https://addify.ae/jobs/${slug}`,
      siteName: "Addify",
      images: [{ url: "/og-default.png" }],
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSalary(job: Job): string {
  const cur = job.currency ?? "AED";
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (job.salary_min && job.salary_max) {
    return `${cur} ${fmt(job.salary_min)} to ${fmt(job.salary_max)} per month`;
  }
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+ per month`;
  if (job.salary_max) return `${cur} ${fmt(job.salary_max)} per month`;
  return "Salary on application";
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function formatDescription(text: string): React.ReactNode {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 1) {
    // Single block — preserve line breaks
    return (
      <p className="whitespace-pre-line text-foreground/85 leading-relaxed">
        {text.trim()}
      </p>
    );
  }
  return paragraphs.map((p, i) => (
    <p key={i} className="whitespace-pre-line text-foreground/85 leading-relaxed mb-4 last:mb-0">
      {p}
    </p>
  ));
}

const COUNTRY_FLAGS: Record<string, string> = {
  UAE: "🇦🇪", "Saudi Arabia": "🇸🇦", Qatar: "🇶🇦",
  Kuwait: "🇰🇼", Bahrain: "🇧🇭", Oman: "🇴🇲", Egypt: "🇪🇬",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const similarJobs = job.category
    ? await getSimilarJobs(job.category, slug)
    : [];

  const salary = fmtSalary(job);
  const flag = COUNTRY_FLAGS[job.country] ?? "🌍";
  const isExternal = job.apply_url.startsWith("http");
  const isMailto = job.apply_url.startsWith("mailto:");

  // JSON-LD JobPosting schema
  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? "",
    datePosted: job.posted_at,
    ...(job.expires_at ? { validThrough: job.expires_at } : {}),
    url: `https://addify.ae/jobs/${slug}`,
    identifier: {
      "@type": "PropertyValue",
      name: "Addify",
      value: slug,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "See job description",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: job.country,
      },
    },
    employmentType: (job.employment_type ?? "FULL_TIME")
      .toUpperCase()
      .replace(/\s+/g, "_"),
    ...(job.salary_min
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.currency ?? "AED",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min,
              maxValue: job.salary_max ?? job.salary_min,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }}
      />

      <main className="flex-1 py-10 md:py-16">
        <Container className="max-w-5xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
            {job.category && (
              <>
                <ChevronRight size={12} />
                <Link
                  href={`/jobs?category=${encodeURIComponent(job.category)}`}
                  className="hover:text-foreground transition-colors"
                >
                  {job.category}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-foreground truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Hero band */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {job.is_featured && (
                    <Badge variant="accent" className="text-xs">Featured</Badge>
                  )}
                  {job.employment_type && (
                    <Badge variant="default" className="text-xs">{job.employment_type}</Badge>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                  {job.company && (
                    <span className="font-medium text-foreground">{job.company}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />{flag} {job.city}, {job.country}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />Posted {timeAgo(job.posted_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply button */}
            <div className="mt-6">
              {isMailto ? (
                <a
                  href={job.apply_url}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
                >
                  Apply via Email <ArrowUpRight size={16} />
                </a>
              ) : isExternal ? (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
                >
                  Apply Now <ArrowUpRight size={16} />
                </a>
              ) : (
                <Link
                  href={job.apply_url}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
                >
                  Apply Now <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Ad slot between hero and body */}
          <AdSlot format="in-article" className="mb-6" />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: description */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft">
                <h2 className="font-display text-xl text-foreground mb-5">Job Description</h2>
                <div className="text-sm leading-relaxed">
                  {formatDescription(job.description ?? "No description provided.")}
                </div>
              </div>

              <AdSlot format="in-article" className="mt-6" />
            </div>

            {/* Right: summary card (sticky) */}
            <div className="lg:col-span-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft sticky top-24">
                <h2 className="font-semibold text-sm text-foreground mb-4">Job Details</h2>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Salary</dt>
                    <dd className="font-semibold text-accent">{salary}</dd>
                  </div>

                  {job.employment_type && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Employment Type</dt>
                      <dd className="text-foreground">{job.employment_type}</dd>
                    </div>
                  )}

                  {job.experience_level && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Experience Level</dt>
                      <dd className="text-foreground">
                        {job.experience_level}
                        {job.experience_label && (
                          <span className="text-muted-foreground ml-1">({job.experience_label})</span>
                        )}
                      </dd>
                    </div>
                  )}

                  {job.qualification && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Qualification</dt>
                      <dd className="text-foreground flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-muted-foreground shrink-0" />
                        {job.qualification}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Location</dt>
                    <dd className="text-foreground flex items-start gap-1.5">
                      <MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                      <span>
                        {job.city}, {job.country}
                        {job.address && (
                          <span className="block text-xs text-muted-foreground mt-0.5">{job.address}</span>
                        )}
                      </span>
                    </dd>
                  </div>

                  {job.category && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Category</dt>
                      <dd className="text-foreground">{job.category}</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Posted</dt>
                    <dd className="text-foreground flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-muted-foreground shrink-0" />
                      {timeAgo(job.posted_at)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 pt-5 border-t border-border">
                  {isMailto ? (
                    <a
                      href={job.apply_url}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent transition-all duration-200"
                    >
                      Apply via Email <ArrowUpRight size={15} />
                    </a>
                  ) : (
                    <a
                      href={job.apply_url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent transition-all duration-200"
                    >
                      Apply Now <ArrowUpRight size={15} />
                    </a>
                  )}
                  <Link
                    href="/jobs"
                    className="mt-3 w-full flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Browse all jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Similar jobs */}
          {similarJobs.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl text-foreground mb-6">Similar jobs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarJobs.map((sj) => (
                  <Link
                    key={sj.id}
                    href={`/jobs/${sj.slug ?? sj.id}`}
                    className="group bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-hover hover:-translate-y-0.5 hover:border-accent/40 transition-all duration-200 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                        {sj.title}
                      </h3>
                      <ArrowUpRight size={14} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {sj.company && <span>{sj.company}</span>}
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />{sj.city}
                      </span>
                    </div>
                    {(sj.salary_min || sj.salary_max) && (
                      <p className="text-xs font-semibold text-accent tabular-nums">
                        {sj.currency} {sj.salary_min?.toLocaleString("en-US")}
                        {sj.salary_max ? ` to ${sj.salary_max.toLocaleString("en-US")}` : "+"} / mo
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA band */}
          <div className="mt-12 bg-card border border-border rounded-2xl p-8 text-center shadow-soft">
            <h2 className="font-display text-2xl text-foreground mb-2">Know what you should earn?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Check salary ranges for your role across the Gulf before you apply.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/salary"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent transition-all duration-200"
              >
                Check Salary Ranges
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
