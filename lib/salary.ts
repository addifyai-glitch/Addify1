import salariesData from "@/data/salaries.json";
import {
  type LeadershipLevel,
  LEADERSHIP_MULTIPLIERS,
  LEADERSHIP_LABELS,
  LEADERSHIP_LEVELS,
} from "@/data/jobTitles";

// ─── Re-export leadership primitives so consumers import from one place ───────
export { LEADERSHIP_LEVELS, LEADERSHIP_LABELS, LEADERSHIP_MULTIPLIERS };
export type { LeadershipLevel };

// ─── Experience bands ─────────────────────────────────────────────────────────

/** Legacy 4-band set — kept for backward compatibility with the 225 SEO pages. */
export type ExperienceBandLegacy = "0-2" | "3-5" | "6-10" | "10+";

/** Full 6-band set used by the form and any new UI. */
export type ExperienceBand = "0-2" | "3-5" | "6-10" | "11-15" | "16-20" | "20+";

/** Bands present in salaries.json (legacy). SEO pages iterate this. */
export const EXPERIENCE_BANDS: ExperienceBandLegacy[] = [
  "0-2",
  "3-5",
  "6-10",
  "10+",
];

/** Full set for the form — includes bands that salaries.json may not have yet. */
export const EXPERIENCE_BANDS_FULL: ExperienceBand[] = [
  "0-2",
  "3-5",
  "6-10",
  "11-15",
  "16-20",
  "20+",
];

/** Short labels for charts / compact UI. */
export const EXPERIENCE_LABELS: Record<ExperienceBand | ExperienceBandLegacy, string> = {
  "0-2":   "0–2 yrs",
  "3-5":   "3–5 yrs",
  "6-10":  "6–10 yrs",
  "10+":   "10+ yrs",
  "11-15": "11–15 yrs",
  "16-20": "16–20 yrs",
  "20+":   "20+ yrs",
};

/** Long labels for form dropdowns and result cards. */
export const EXPERIENCE_LABELS_LONG: Record<ExperienceBand | ExperienceBandLegacy, string> = {
  "0-2":   "0–2 years",
  "3-5":   "3–5 years",
  "6-10":  "6–10 years",
  "10+":   "10+ years",
  "11-15": "11–15 years",
  "16-20": "16–20 years",
  "20+":   "20+ years",
};

/**
 * Maps the new experience bands to the closest legacy band in salaries.json.
 * Used when salaries.json hasn't been updated yet (step 4).
 */
const EXPERIENCE_BAND_FALLBACK: Record<string, ExperienceBandLegacy> = {
  "0-2":   "0-2",
  "3-5":   "3-5",
  "6-10":  "6-10",
  "10+":   "10+",
  "11-15": "10+",
  "16-20": "10+",
  "20+":   "10+",
};

/**
 * Scaling factors applied on top of the legacy "10+" band for new bands.
 * Removed once salaries.json has native data for each band.
 */
const EXPERIENCE_SENIOR_SCALE: Record<string, number> = {
  "11-15": 1.10,
  "16-20": 1.22,
  "20+":   1.35,
};

// ─── City / Role interfaces ───────────────────────────────────────────────────

export interface CityConfig {
  name: string;
  country: string;
  currency: string;
  factor: number;
}

export interface BandData {
  p25: number;
  median: number;
  p75: number;
  housing: number;
  total: number;
}

export interface RoleData {
  title: string;
  category: string;
  base: Record<string, BandData>;
}

export interface SalaryResult {
  roleSlug: string;
  roleTitle: string;
  citySlug: string;
  cityName: string;
  country: string;
  currency: string;
  experience: ExperienceBand | ExperienceBandLegacy;
  leadershipLevel: LeadershipLevel;
  p25: number;
  median: number;
  p75: number;
  housingMonthly: number;
  totalPackage: number;
  housingPct: number;
  totalPct: number;
}

// ─── Data access ──────────────────────────────────────────────────────────────

const data = salariesData as unknown as {
  cityFactors: Record<string, CityConfig>;
  roles: Record<string, RoleData>;
};

export const CITY_CONFIGS: Record<string, CityConfig> = data.cityFactors;
export const ROLES: Record<string, RoleData> = data.roles;
export const ROLE_SLUGS = Object.keys(ROLES);
export const CITY_SLUGS = Object.keys(CITY_CONFIGS);

// ─── Computation helpers ──────────────────────────────────────────────────────

function roundForCurrency(value: number, currency: string): number {
  const nearest = ["KWD", "BHD", "OMR"].includes(currency) ? 25 : 500;
  return Math.round(value / nearest) * nearest;
}

/**
 * Core salary computation.
 *
 * Accepts both legacy 4-band keys and the new 6-band keys.
 * For new bands not yet in salaries.json, falls back to the nearest legacy
 * band and applies a senior-experience scaling factor.
 *
 * Returns null when:
 * - roleSlug or citySlug are unknown
 * - salarySlug on the job title is null (no data for this title yet)
 */
export function computeSalary(
  roleSlug: string,
  citySlug: string,
  experience: ExperienceBand | ExperienceBandLegacy,
  leadershipLevel: LeadershipLevel = "individual-contributor"
): SalaryResult | null {
  const role = ROLES[roleSlug];
  const city = CITY_CONFIGS[citySlug];
  if (!role || !city) return null;

  // Resolve to a band that exists in the JSON
  const jsonBand =
    (EXPERIENCE_BAND_FALLBACK[experience] as ExperienceBandLegacy) ?? experience;
  const base = role.base[jsonBand];
  if (!base) return null;

  // Senior-band scale (1.0 for legacy bands that have native data)
  const seniorScale = EXPERIENCE_SENIOR_SCALE[experience] ?? 1.0;

  // Leadership multiplier
  const levelMultiplier = LEADERSHIP_MULTIPLIERS[leadershipLevel] ?? 1.0;

  const totalMultiplier = seniorScale * levelMultiplier;

  const f = city.factor;
  const cur = city.currency;

  const p25 = roundForCurrency(base.p25 * f * totalMultiplier, cur);
  const median = roundForCurrency(base.median * f * totalMultiplier, cur);
  const p75 = roundForCurrency(base.p75 * f * totalMultiplier, cur);
  const housingMonthly = roundForCurrency(median * (base.housing / 100), cur);
  const totalPackage = roundForCurrency(median * (1 + base.total / 100), cur);

  return {
    roleSlug,
    roleTitle: role.title,
    citySlug,
    cityName: city.name,
    country: city.country,
    currency: cur,
    experience,
    leadershipLevel,
    p25,
    median,
    p75,
    housingMonthly,
    totalPackage,
    housingPct: base.housing,
    totalPct: base.total,
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString("en-US")}`;
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

export function buildMetaTitle(roleTitle: string, cityName: string): string {
  return `${roleTitle} Salary in ${cityName} 2025 | Addify`;
}

export function buildMetaDescription(
  result: SalaryResult,
  allBands: SalaryResult[]
): string {
  const mid = allBands.find((r) => r.experience === "3-5") ?? result;
  return (
    `${result.roleTitle} salary in ${result.cityName}: median ${formatCurrency(mid.median, result.currency)}/month ` +
    `for 3–5 years experience (range ${formatCurrency(mid.p25, result.currency)}–${formatCurrency(mid.p75, result.currency)}). ` +
    `Based on 2025 GCC market benchmarks.`
  );
}
