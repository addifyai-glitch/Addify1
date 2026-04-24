"use client";

import { useState, useEffect, useCallback } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ui/ad-slot";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { JOB_CATEGORIES } from "@/data/jobTitles";
import { CITY_GROUPS } from "@/data/cities";
import type { Job } from "@/types/job";
import { MapPin, Clock, ArrowUpRight, Briefcase, Search, X } from "lucide-react";

const COUNTRIES = ["All", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt"];
const EXPERIENCE = ["All", "0-2 years", "3-5 years", "6-10 years", "10+"];

const COUNTRY_FLAGS: Record<string, string> = {
  UAE: "🇦🇪", "Saudi Arabia": "🇸🇦", Qatar: "🇶🇦",
  Kuwait: "🇰🇼", Bahrain: "🇧🇭", Oman: "🇴🇲", Egypt: "🇪🇬",
};

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function fmtSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  const cur = job.currency ?? "";
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (job.salary_min && job.salary_max) return `${cur} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+`;
  return null;
}

function JobCard({ job }: { job: Job }) {
  const salary = fmtSalary(job);
  const flag = COUNTRY_FLAGS[job.country] ?? "🌍";
  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col gap-3">
      {job.featured && (
        <Badge variant="accent" className="absolute top-3 right-3 text-xs">Featured</Badge>
      )}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Briefcase size={16} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{job.company}</p>
      </div>
      <h3 className="text-base font-semibold text-foreground leading-snug">{job.title}</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={11} />{flag} {job.city}
        </span>
        {job.experience_level && <span>{job.experience_level}</span>}
        <span className="flex items-center gap-1">
          <Clock size={11} />{timeAgo(job.posted_at)}
        </span>
      </div>
      {salary && <p className="text-sm font-semibold text-accent tabular-nums">{salary} / mo</p>}
      <a
        href={job.apply_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-accent transition-colors duration-200"
      >
        Apply <ArrowUpRight size={14} />
      </a>
    </div>
  );
}

export default function JobsPage() {
  const [country, setCountry] = useState("All");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const cityOptions = country === "All"
    ? ["All"]
    : ["All", ...(CITY_GROUPS.find((g) => g.country === country)?.cities.map((c) => c.name) ?? [])];

  const fetchJobs = useCallback(async (offset = 0, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "12", offset: String(offset) });
    if (country !== "All") params.set("country", country);
    if (city !== "All") params.set("city", city);
    if (category !== "All") params.set("category", category);
    if (experience !== "All") params.set("experience", experience);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs((prev) => append ? [...prev, ...(data.jobs ?? [])] : (data.jobs ?? []));
      setTotal(data.total ?? 0);
    } catch {
      if (!append) setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [country, city, category, experience, search]);

  useEffect(() => {
    setPage(0);
    setCity("All");
    fetchJobs(0, false);
  }, [country]);

  useEffect(() => {
    setPage(0);
    fetchJobs(0, false);
  }, [city, category, experience, search]);

  function clearFilters() {
    setCountry("All"); setCity("All"); setCategory("All");
    setExperience("All"); setSearch("");
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchJobs(next * 12, true);
  }

  const hasActiveFilter = country !== "All" || city !== "All" || category !== "All" || experience !== "All" || search !== "";
  const selectCls = "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none appearance-none cursor-pointer";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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
          {/* Filter bar */}
          <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 shadow-soft">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <select className={selectCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {cityOptions.length > 1 && (
                <select className={selectCls} value={city} onChange={(e) => setCity(e.target.value)}>
                  {cityOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              )}
              <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All categories</option>
                {JOB_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select className={selectCls} value={experience} onChange={(e) => setExperience(e.target.value)}>
                {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
              </select>
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-5">
              Showing {jobs.length} of {total} jobs
            </p>
          )}

          {/* Ad slot */}
          <AdSlot slot="in-content" className="mb-8" />

          {/* Grid */}
          {loading && jobs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <Briefcase size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-base font-semibold text-foreground mb-1">No jobs match your filters</p>
              <p className="text-sm text-muted-foreground mb-5">Try broadening your search or clearing filters.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Clear filters
                </button>
                <Link href="/submit-job" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  Submit a job →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}

          {/* Load more */}
          {jobs.length < total && !loading && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Load more jobs
              </button>
            </div>
          )}

          {/* Post a job CTA */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-3">Hiring? Post your opening for free.</p>
            <Link
              href="/submit-job"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent transition-all duration-200"
            >
              Post a Job →
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
