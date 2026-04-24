"use client";

import { useState } from "react";
import {
  CITY_CONFIGS,
  CITY_SLUGS,
  EXPERIENCE_BANDS,
  EXPERIENCE_LABELS_LONG,
  computeSalary,
  formatCurrency,
  type ExperienceBandLegacy,
  type SalaryResult,
} from "@/lib/salary";
import { JOB_CATEGORIES, getJobTitleBySlug } from "@/data/jobTitles";
import { CITY_GROUPS, CITIES_WITH_DATA } from "@/data/cities";

// Map city name → slug in CITY_CONFIGS
const cityNameToSlug = new Map<string, string>(
  CITY_SLUGS.map((slug) => [CITY_CONFIGS[slug].name, slug])
);

export default function SalaryForm() {
  const [titleSlug, setTitleSlug] = useState("");
  // cityValue stores the city name (e.g. "Dubai") — works for all 34 cities
  const [cityValue, setCityValue] = useState("");
  const [experience, setExperience] = useState<ExperienceBandLegacy | "">("");

  const jobTitle = titleSlug ? getJobTitleBySlug(titleSlug) : undefined;
  const salarySlug = jobTitle?.salarySlug ?? null;
  const noTitleData = !!titleSlug && salarySlug === null;

  // Resolve city name → salary slug (null for cities without data)
  const resolvedCitySlug = cityValue ? (cityNameToSlug.get(cityValue) ?? null) : null;
  const noCityData = !!cityValue && !CITIES_WITH_DATA.has(cityValue);

  const noData = noTitleData || noCityData;

  const result: SalaryResult | null =
    salarySlug && resolvedCitySlug && experience && !noData
      ? computeSalary(salarySlug, resolvedCitySlug, experience as ExperienceBandLegacy)
      : null;

  const ready = titleSlug && cityValue && experience;

  return (
    <div>
      {/* Form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Job Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
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
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
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
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
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

        {noData && (
          <p className="mt-4 text-sm text-[var(--muted)] text-center">
            We don&apos;t have data for this combination yet —{" "}
            <a href="/contribute" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">
              help us by contributing your salary
            </a>
            .
          </p>
        )}
        {!ready && !noData && (
          <p className="mt-4 text-sm text-[var(--muted)] text-center">
            Select all three fields to see your salary estimate.
          </p>
        )}
      </div>

      {/* Result card */}
      {result && <ResultCard result={result} />}
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
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: median */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
            Median Monthly Salary
          </p>
          <p className="text-4xl font-bold text-[var(--accent)] tabular-nums leading-none">
            {fmt(result.median)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">per month (basic)</p>

          {/* Range bar */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
              25th – 75th Percentile Range
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
              Typical Housing Allowance
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {fmt(result.housingMonthly)}
              <span className="text-sm font-normal text-[var(--muted)]">
                /mo
              </span>
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              ~{result.housingPct}% of basic salary
            </p>
          </div>

          <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
              Estimated Total Package
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {fmt(result.totalPackage)}
              <span className="text-sm font-normal text-[var(--muted)]">
                /mo
              </span>
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Basic + housing + transport + allowances (~+{result.totalPct}%)
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-5">
        <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-4">
          Estimates based on Bayt Salary Report 2024, Robert Half GCC, and
          Cooper Fitch Salary Survey. Actual compensation varies by company,
          nationality, and negotiation.
        </p>
      </div>
    </div>
  );
}
