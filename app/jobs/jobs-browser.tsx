"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ui/ad-slot";
import { JOB_CATEGORIES } from "@/data/jobTitles";
import { CITY_GROUPS } from "@/data/cities";
import type { Job } from "@/types/job";
import { MapPin, Clock, Briefcase, Search, X, ChevronRight, Wifi } from "lucide-react";

const COUNTRIES = ["All", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt"];
const EXPERIENCE = [
  { value: "All",       label: "All experience" },
  { value: "Entry",     label: "Entry (0-2 yrs)" },
  { value: "Mid",       label: "Mid (3-5 yrs)" },
  { value: "Senior",    label: "Senior (6-10 yrs)" },
  { value: "Executive", label: "Executive (10+)" },
];

const EXP_LABEL: Record<string, string> = {
  Entry: "0-2 yrs", Mid: "3-5 yrs", Senior: "6-10 yrs", Executive: "10+",
};
const WORK_TYPES = ["All", "Remote", "Hybrid", "On-site"];

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
  if (job.salary_min && job.salary_max) return `${cur} ${fmt(job.salary_min)} to ${fmt(job.salary_max)}`;
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+`;
  return null;
}

function WorkTypePill({ type }: { type: string }) {
  const isRemote = type.toLowerCase() === "remote";
  const isHybrid = type.toLowerCase() === "hybrid";
  if (!isRemote && !isHybrid) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      isRemote
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    }`}>
      <Wifi size={10} />
      {type}
    </span>
  );
}

function JobCard({ job }: { job: Job }) {
  const salary = fmtSalary(job);
  const flag = COUNTRY_FLAGS[job.country] ?? "🌍";
  const slug = job.slug ?? job.id;
  return (
    <Link
      href={`/jobs/${slug}`}
      data-testid="job-card"
      className="group relative bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        {(job.is_featured) && (
          <Badge variant="accent" className="text-xs">Featured</Badge>
        )}
        {job.employment_type && <WorkTypePill type={job.employment_type} />}
        {!job.is_featured && !job.employment_type && <span />}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Briefcase size={16} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{job.company}</p>
      </div>
      <h3 className="text-base font-semibold text-foreground leading-snug">{job.title}</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={11} />{job.city ? `${flag} ${job.city}` : "Remote"}
        </span>
        {job.experience_level && <span>{EXP_LABEL[job.experience_level] ?? job.experience_level}</span>}
        <span className="flex items-center gap-1">
          <Clock size={11} />{timeAgo(job.posted_at)}
        </span>
      </div>
      {salary && <p className="text-sm font-semibold text-accent tabular-nums">{salary} / mo</p>}
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-accent transition-colors duration-200">
        View job <ChevronRight size={14} />
      </span>
    </Link>
  );
}

export function JobsBrowser({ jobs }: { jobs: Job[] }) {
  const [country, setCountry] = useState("All");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [workType, setWorkType] = useState("All");
  const [search, setSearch] = useState("");

  const cityOptions = country === "All"
    ? ["All"]
    : ["All", ...(CITY_GROUPS.find((g) => g.country === country)?.cities.map((c) => c.name) ?? [])];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (country !== "All" && job.country !== country) return false;
      if (city !== "All" && job.city !== city) return false;
      if (category !== "All" && job.category?.toLowerCase() !== category.toLowerCase()) return false;
      if (experience !== "All" && job.experience_level?.toLowerCase() !== experience.toLowerCase()) return false;
      if (workType !== "All") {
        const isOnSite = workType.toLowerCase() === "on-site";
        const matchesOnSite = !job.employment_type || job.employment_type.toLowerCase() === "on-site";
        if (isOnSite ? !matchesOnSite : job.employment_type?.toLowerCase() !== workType.toLowerCase()) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${job.title} ${job.company ?? ""} ${job.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, country, city, category, experience, workType, search]);

  function clearFilters() {
    setCountry("All"); setCity("All"); setCategory("All");
    setExperience("All"); setWorkType("All"); setSearch("");
  }

  const hasActiveFilter = country !== "All" || city !== "All" || category !== "All" || experience !== "All" || workType !== "All" || search !== "";
  const selectCls = "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none appearance-none cursor-pointer";

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 shadow-soft">
        {/* Work type pill toggles */}
        <div className="flex flex-wrap gap-2 mb-3">
          {WORK_TYPES.map((type) => {
            const isActive = workType === type;
            return (
              <button
                key={type}
                onClick={() => setWorkType(type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  isActive
                    ? type === "Remote"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : type === "Hybrid"
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400"
                      : "bg-accent/15 border-accent/40 text-accent"
                    : "bg-background border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
                }`}
              >
                {type === "Remote" && <Wifi size={11} />}
                {type}
              </button>
            );
          })}
        </div>

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
          <select className={selectCls} value={country} onChange={(e) => { setCountry(e.target.value); setCity("All"); }}>
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
            {EXPERIENCE.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
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
      <p className="text-sm text-foreground/75 mb-5">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      {/* Ad slot */}
      <AdSlot format="in-article" className="mb-8" />

      {/* Grid */}
      {filteredJobs.length === 0 ? (
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
          {filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
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
    </>
  );
}
