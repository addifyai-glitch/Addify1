"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, ArrowUpRight, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/types/job";

const COUNTRY_FLAGS: Record<string, string> = {
  UAE: "🇦🇪", "Saudi Arabia": "🇸🇦", Qatar: "🇶🇦",
  Kuwait: "🇰🇼", Bahrain: "🇧🇭", Oman: "🇴🇲", Egypt: "🇪🇬",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function fmtSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const cur = job.currency ?? "";
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (job.salary_min && job.salary_max)
    return `${cur} ${fmt(job.salary_min)} to ${fmt(job.salary_max)}`;
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+`;
  return null;
}

function JobCard({ job }: { job: Job }) {
  const salary = fmtSalary(job);
  const flag = COUNTRY_FLAGS[job.country] ?? "🌍";

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col gap-3">
      {job.is_featured && (
        <Badge variant="accent" className="absolute top-3 right-3">
          Featured
        </Badge>
      )}

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Briefcase size={16} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{job.company}</p>
      </div>

      <h3 className="text-base font-semibold text-foreground leading-snug">
        {job.title}
      </h3>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {flag} {job.city}
        </span>
        {job.experience_level && (
          <span>{job.experience_level}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {timeAgo(job.posted_at)}
        </span>
      </div>

      {salary && (
        <p className="text-sm font-semibold text-accent tabular-nums">{salary} / mo</p>
      )}

      <a
        href={job.apply_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-accent transition-colors duration-200"
      >
        Apply
        <ArrowUpRight size={14} />
      </a>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-12 border border-dashed border-border rounded-xl">
      <Briefcase size={32} className="mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-base font-semibold text-foreground mb-1">
        No open roles here yet
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Be the first to list a position in this area.
      </p>
      <Link
        href="/submit-job"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Post a job for free
      </Link>
    </div>
  );
}

export function LiveJobs({
  jobTitle,
  city,
  category,
}: {
  jobTitle: string;
  city: string;
  category?: string;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) { setLoading(false); return; }
    setLoading(true);

    async function fetchJobs() {
      let results: Job[] = [];

      if (category) {
        // 1. Try category + city first
        const p1 = new URLSearchParams({ category, city, limit: "6" });
        const d1 = await fetch(`/api/jobs?${p1}`).then(r => r.json()).catch(() => ({ jobs: [] }));
        results = d1.jobs ?? [];

        // 2. If fewer than 6, fill with same category from anywhere
        if (results.length < 6) {
          const p2 = new URLSearchParams({ category, limit: "12" });
          const d2 = await fetch(`/api/jobs?${p2}`).then(r => r.json()).catch(() => ({ jobs: [] }));
          const extra = (d2.jobs ?? []).filter((j: Job) => !results.some(r => r.id === j.id));
          results = [...results, ...extra].slice(0, 6);
        }
      }

      // 3. Fallback: just by city
      if (results.length === 0) {
        const p3 = new URLSearchParams({ city, limit: "6" });
        const d3 = await fetch(`/api/jobs?${p3}`).then(r => r.json()).catch(() => ({ jobs: [] }));
        results = d3.jobs ?? [];
      }

      setJobs(results);
      setLoading(false);
    }

    fetchJobs();
  }, [jobTitle, city, category]);

  if (!city) return null;

  const cityLabel = city || "the Gulf";

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">
          Latest Openings
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          {category ? `${category} roles in ${cityLabel}` : `Open roles in ${cityLabel}`}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length === 0 ? <EmptyState /> : jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}

      <p className="mt-4 text-right">
        <Link
          href="/jobs"
          className="text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          See all jobs
        </Link>
        <span className="mx-2 text-muted-foreground/40">·</span>
        <Link
          href="/submit-job"
          className="text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          Hiring? Post a job for free
        </Link>
      </p>
    </section>
  );
}
