"use client";

import { useState } from "react";
import {
  ALL_CITY_CONFIGS,
  EXPERIENCE_BANDS,
  EXPERIENCE_LABELS_LONG,
  computeSalary,
  computeSalaryFallback,
  formatCurrency,
  type ExperienceBandLegacy,
  type SalaryResult,
} from "@/lib/salary";
import { JOB_CATEGORIES, getJobTitleBySlug } from "@/data/jobTitles";
import { CITY_GROUPS, CITIES } from "@/data/cities";
import { LiveJobs } from "@/components/sections/live-jobs";
import { AdSlot } from "@/components/ui/ad-slot";
import { SourceAttribution } from "@/components/salary/source-attribution";

// Map city name → slug across all city configs (primary + extended)
const cityNameToSlug = new Map<string, string>(
  Object.entries(ALL_CITY_CONFIGS).map(([slug, city]) => [city.name, slug])
);

export default function SalaryForm() {
  const [titleSlug, setTitleSlug] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [experience, setExperience] = useState<ExperienceBandLegacy | "">("");
  const [submitted, setSubmitted] = useState(false);

  const jobTitle = titleSlug ? getJobTitleBySlug(titleSlug) : undefined;
  const salarySlug = jobTitle?.salarySlug ?? null;
  const resolvedCitySlug = cityValue ? (cityNameToSlug.get(cityValue) ?? null) : null;

  const primaryResult: SalaryResult | null =
    salarySlug && resolvedCitySlug && experience
      ? computeSalary(salarySlug, resolvedCitySlug, experience as ExperienceBandLegacy)
      : null;

  const result: SalaryResult | null =
    primaryResult ??
    (titleSlug && resolvedCitySlug && experience
      ? computeSalaryFallback(
          jobTitle?.category ?? "",
          resolvedCitySlug,
          experience as ExperienceBandLegacy,
          "individual-contributor",
          jobTitle?.title ?? titleSlug,
          titleSlug,
        )
      : null);

  const ready = !!(titleSlug && cityValue && experience);
  const jobCategory = jobTitle?.category ?? "";
  const selectedCountry = cityValue
    ? (CITIES.find((c) => c.name === cityValue)?.country ?? "UAE")
    : "UAE";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ready) setSubmitted(true);
  }

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Job Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-foreground/75">
              Job Title
            </label>
            <select
              value={titleSlug}
              onChange={(e) => setTitleSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none cursor-pointer"
            >
              <option value="">Select a role…</option>
              {JOB_CATEGORIES.map((cat) => (
                <optgroup key={cat.name} label={cat.name}>
                  {cat.titles.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-foreground/75">
              City
            </label>
            <select
              value={cityValue}
              onChange={(e) => setCityValue(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none cursor-pointer"
            >
              <option value="">Select a city…</option>
              {CITY_GROUPS.map((group) => (
                <optgroup key={group.country} label={`${group.country} (${group.currency})`}>
                  {group.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-foreground/75">
              Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceBandLegacy)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none cursor-pointer"
            >
              <option value="">Select experience…</option>
              {EXPERIENCE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {EXPERIENCE_LABELS_LONG[band]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="submit"
            disabled={!ready}
            aria-disabled={!ready}
            aria-label="Check salary for selected role, city, and experience"
            className={`w-full md:w-auto rounded-full px-8 py-3 font-semibold shadow-soft transition-all duration-200 ${ready ? "bg-accent text-accent-foreground hover:shadow-glow-accent hover:-translate-y-0.5" : "bg-accent/50 text-accent-foreground/60 cursor-not-allowed"}`}
          >
            Check Salary
          </button>
        </div>
      </form>

      {/* Result card */}
      {submitted && result && (
        <>
          <ResultCard result={result} />
          <SourceAttribution country={selectedCountry} />
        </>
      )}
      {submitted && ready && !result && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-base font-semibold text-[var(--foreground)] mb-1">
            We couldn&apos;t generate an estimate for this combination.
          </p>
          <p className="text-sm text-muted-foreground">
            Try a different role or city.
          </p>
        </div>
      )}

      {/* Ad + live jobs (always shown once city is selected) */}
      {cityValue && (
        <>
          <AdSlot format="in-article" className="mt-10" />
          <LiveJobs jobTitle={jobTitle?.title ?? ""} city={cityValue} category={jobCategory} />
        </>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SalaryResult }) {
  const fmt = (v: number) => formatCurrency(v, result.currency);

  return (
    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header strip */}
      <div className="bg-[var(--foreground)] px-6 py-4 flex flex-wrap items-center gap-2">
        <span className="text-white font-semibold text-base">
          {result.roleTitle}
        </span>
        <span className="text-white/40">·</span>
        <span className="text-white/70 text-sm">{result.cityName}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/70 text-sm">
          {EXPERIENCE_LABELS_LONG[result.experience]}
        </span>
        {result.isEstimate && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
            Estimated
          </span>
        )}
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: median */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Median Monthly Salary
          </p>
          <p className="text-4xl font-bold text-[var(--accent)] tabular-nums leading-none">
            {fmt(result.median)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">per month (basic)</p>

          {/* Range bar */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              25th to 75th Percentile Range
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)] tabular-nums">
                {fmt(result.p25)}
              </span>
              <div className="flex-1 h-2 rounded-full bg-[var(--accent-light)] relative">
                <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-60" />
              </div>
              <span className="text-sm font-medium text-[var(--foreground)] tabular-nums">
                {fmt(result.p75)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: allowances */}
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Typical Housing Allowance
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {fmt(result.housingMonthly)}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ~{result.housingPct}% of basic salary
            </p>
          </div>

          <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Estimated Total Package
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {fmt(result.totalPackage)}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basic + housing + transport + allowances (~+{result.totalPct}%)
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-5">
        {result.isEstimate ? (
          <p className="text-xs text-muted-foreground border-t border-[var(--border)] pt-4">
            These figures are regional estimates based on GCC market benchmarks and category averages.
            Actual compensation varies by company, nationality, and negotiation.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground border-t border-[var(--border)] pt-4">
            Estimates based on Bayt Salary Report 2024, Robert Half GCC, and
            Cooper Fitch Salary Survey. Actual compensation varies by company,
            nationality, and negotiation.
          </p>
        )}
      </div>
    </div>
  );
}
