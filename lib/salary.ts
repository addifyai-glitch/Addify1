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
  isEstimate?: boolean;
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

// ─── Fallback: extended city configs + category base rates ───────────────────

const EXTENDED_CITY_CONFIGS: Record<string, CityConfig> = {
  // UAE (AED) — cities not in salaries.json
  "ajman":             { name: "Ajman",             country: "UAE",          currency: "AED", factor: 0.75 },
  "ras-al-khaimah":    { name: "Ras Al Khaimah",    country: "UAE",          currency: "AED", factor: 0.77 },
  "fujairah":          { name: "Fujairah",           country: "UAE",          currency: "AED", factor: 0.79 },
  "umm-al-quwain":     { name: "Umm Al Quwain",     country: "UAE",          currency: "AED", factor: 0.70 },
  // Saudi Arabia (SAR)
  "mecca":             { name: "Mecca",              country: "Saudi Arabia", currency: "SAR", factor: 0.87 },
  "medina":            { name: "Medina",             country: "Saudi Arabia", currency: "SAR", factor: 0.84 },
  "dammam":            { name: "Dammam",             country: "Saudi Arabia", currency: "SAR", factor: 0.92 },
  "khobar":            { name: "Khobar",             country: "Saudi Arabia", currency: "SAR", factor: 0.90 },
  "dhahran":           { name: "Dhahran",            country: "Saudi Arabia", currency: "SAR", factor: 0.93 },
  "taif":              { name: "Taif",               country: "Saudi Arabia", currency: "SAR", factor: 0.77 },
  "tabuk":             { name: "Tabuk",              country: "Saudi Arabia", currency: "SAR", factor: 0.69 },
  "abha":              { name: "Abha",               country: "Saudi Arabia", currency: "SAR", factor: 0.68 },
  // Qatar (QAR)
  "al-rayyan":         { name: "Al Rayyan",          country: "Qatar",        currency: "QAR", factor: 1.06 },
  // Kuwait (KWD)
  "hawalli":           { name: "Hawalli",            country: "Kuwait",       currency: "KWD", factor: 0.040 },
  "salmiya":           { name: "Salmiya",            country: "Kuwait",       currency: "KWD", factor: 0.041 },
  // Bahrain (BHD)
  "riffa":             { name: "Riffa",              country: "Bahrain",      currency: "BHD", factor: 0.044 },
  "muharraq":          { name: "Muharraq",           country: "Bahrain",      currency: "BHD", factor: 0.043 },
  // Oman (OMR)
  "salalah":           { name: "Salalah",            country: "Oman",         currency: "OMR", factor: 0.046 },
  "sohar":             { name: "Sohar",              country: "Oman",         currency: "OMR", factor: 0.048 },
  "nizwa":             { name: "Nizwa",              country: "Oman",         currency: "OMR", factor: 0.045 },
  // Egypt (EGP, 1 AED ≈ 13.5 EGP; factors encode salary level × currency)
  "cairo":             { name: "Cairo",              country: "Egypt",        currency: "EGP", factor: 4.0 },
  "alexandria":        { name: "Alexandria",         country: "Egypt",        currency: "EGP", factor: 3.7 },
  "giza":              { name: "Giza",               country: "Egypt",        currency: "EGP", factor: 3.8 },
  "new-cairo":         { name: "New Cairo",          country: "Egypt",        currency: "EGP", factor: 4.2 },
  "6th-october-city":  { name: "6th October City",   country: "Egypt",        currency: "EGP", factor: 3.6 },
};

export const ALL_CITY_CONFIGS: Record<string, CityConfig> = {
  ...CITY_CONFIGS,
  ...EXTENDED_CITY_CONFIGS,
};

// Category base rates in AED, at the 3-5yr reference level — same scale as salaries.json
const CATEGORY_BASE: Record<string, { p25: number; median: number; p75: number; housing: number; total: number }> = {
  "Executive & C-Suite":          { p25: 28000, median: 45000, p75: 70000, housing: 30, total: 40 },
  "Technology & Engineering":     { p25: 12000, median: 17000, p75: 24000, housing: 25, total: 35 },
  "Finance & Accounting":         { p25: 10000, median: 14000, p75: 20000, housing: 25, total: 35 },
  "Marketing & Communications":   { p25:  9000, median: 13000, p75: 18000, housing: 25, total: 35 },
  "Sales & Business Development": { p25:  9000, median: 14000, p75: 22000, housing: 25, total: 38 },
  "Human Resources & People":     { p25:  9000, median: 13000, p75: 18000, housing: 25, total: 35 },
  "Operations & Supply Chain":    { p25:  8000, median: 12000, p75: 17000, housing: 25, total: 35 },
  "Legal & Compliance":           { p25: 12000, median: 18000, p75: 26000, housing: 25, total: 35 },
  "Product & Design":             { p25: 10000, median: 15000, p75: 21000, housing: 25, total: 35 },
  "Consulting & Strategy":        { p25: 13000, median: 19000, p75: 28000, housing: 25, total: 35 },
  "Construction & Real Estate":   { p25:  9000, median: 14000, p75: 20000, housing: 25, total: 35 },
  "Healthcare":                   { p25: 10000, median: 15000, p75: 22000, housing: 25, total: 35 },
  "Hospitality & Retail":         { p25:  5000, median:  8000, p75: 13000, housing: 20, total: 30 },
  "Education":                    { p25:  7000, median: 10000, p75: 15000, housing: 25, total: 30 },
  "Administration & Support":     { p25:  5000, median:  8000, p75: 12000, housing: 20, total: 30 },
};

const FALLBACK_EXP_MULTIPLIERS: Record<string, number> = {
  "0-2":   0.55,
  "3-5":   1.00,
  "6-10":  1.55,
  "10+":   2.20,
  "11-15": 2.42,
  "16-20": 2.68,
  "20+":   2.97,
};

export function computeSalaryFallback(
  category: string,
  citySlug: string,
  experience: ExperienceBand | ExperienceBandLegacy,
  leadershipLevel: LeadershipLevel = "individual-contributor",
  roleTitle: string,
  roleSlug: string,
): SalaryResult | null {
  const base = CATEGORY_BASE[category];
  const city = ALL_CITY_CONFIGS[citySlug];
  if (!base || !city) return null;

  const expMult = FALLBACK_EXP_MULTIPLIERS[experience] ?? 1.0;
  const levelMult = LEADERSHIP_MULTIPLIERS[leadershipLevel] ?? 1.0;
  const totalMult = expMult * levelMult;
  const f = city.factor;
  const cur = city.currency;

  const p25          = roundForCurrency(base.p25    * f * totalMult, cur);
  const median       = roundForCurrency(base.median * f * totalMult, cur);
  const p75          = roundForCurrency(base.p75    * f * totalMult, cur);
  const housingMonthly = roundForCurrency(median * (base.housing / 100), cur);
  const totalPackage   = roundForCurrency(median * (1 + base.total / 100), cur);

  return {
    roleSlug,
    roleTitle,
    citySlug,
    cityName: city.name,
    country:  city.country,
    currency: cur,
    experience,
    leadershipLevel,
    p25,
    median,
    p75,
    housingMonthly,
    totalPackage,
    housingPct: base.housing,
    totalPct:   base.total,
    isEstimate: true,
  };
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

export function buildMetaTitle(roleTitle: string, cityName: string): string {
  return `${roleTitle} Salary in ${cityName} 2025`;
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
