// The comparison engine. Reads ALL salary numbers from getSalaryFigure()
// (single source of truth) so a comparison can never contradict a salary page.
//
// Purchasing-power and hiring-demand sections are GATED — when data is absent
// the page renders honest "not yet quantified" copy. Do not remove the gating.

import { getSalaryFigure, SalaryFigure } from "./salary-source-of-truth";
import {
  CITIES, ROLES, City, Role, cityBySlug, roleBySlug,
} from "./salary-taxonomy";

// ─── URL grammar ──────────────────────────────────────────────────────────────
// /salary/compare/{role}-salary-{a}-vs-{b}
// e.g. software-engineer-salary-dubai-vs-riyadh   (city scope)
//      accountant-salary-uae-vs-saudi              (country scope)

export type Scope = "city" | "country";

export interface ParsedComparison {
  role: Role;
  scope: Scope;
  leftSlug: string;
  rightSlug: string;
  leftLabel: string;
  rightLabel: string;
}

const COUNTRY_ALIASES: Record<string, string> = {
  "uae": "UAE", "united-arab-emirates": "UAE",
  "saudi": "Saudi Arabia", "saudi-arabia": "Saudi Arabia", "ksa": "Saudi Arabia",
  "qatar": "Qatar", "kuwait": "Kuwait", "bahrain": "Bahrain",
  "oman": "Oman",
};

export function citiesForCountry(countryName: string): City[] {
  return CITIES.filter((c) => c.country === countryName);
}

export function parseComparisonSlug(slug: string): ParsedComparison | null {
  const marker = "-salary-";
  const idx = slug.indexOf(marker);
  if (idx === -1) return null;

  const roleSlug = slug.slice(0, idx);
  const rest = slug.slice(idx + marker.length);
  const vsIdx = rest.indexOf("-vs-");
  if (vsIdx === -1) return null;

  const leftSlug = rest.slice(0, vsIdx);
  const rightSlug = rest.slice(vsIdx + "-vs-".length);

  const role = roleBySlug(roleSlug);
  if (!role) return null;

  const leftCity = cityBySlug(leftSlug);
  const rightCity = cityBySlug(rightSlug);
  if (leftCity && rightCity) {
    return {
      role, scope: "city",
      leftSlug, rightSlug,
      leftLabel: leftCity.name, rightLabel: rightCity.name,
    };
  }

  const leftCountry = COUNTRY_ALIASES[leftSlug];
  const rightCountry = COUNTRY_ALIASES[rightSlug];
  if (leftCountry && rightCountry) {
    return {
      role, scope: "country",
      leftSlug, rightSlug,
      leftLabel: leftCountry, rightLabel: rightCountry,
    };
  }

  return null;
}

// ─── Salary resolution ───────────────────────────────────────────────────────

export interface SideFigure {
  label: string;
  currency: string;
  median: number;
  min: number;
  max: number;
  sampleSize: number;
  citiesWithData?: number;
}

async function resolveCity(citySlug: string, roleSlug: string, label: string): Promise<SideFigure | null> {
  const f = await getSalaryFigure(citySlug, roleSlug);
  if (!f) return null;
  return {
    label, currency: f.currency,
    median: f.monthlyMedian, min: f.monthlyMin, max: f.monthlyMax,
    sampleSize: f.sampleSize,
  };
}

async function resolveCountry(countryName: string, roleSlug: string, label: string): Promise<SideFigure | null> {
  const cities = citiesForCountry(countryName);
  const figs: SalaryFigure[] = [];
  for (const c of cities) {
    const f = await getSalaryFigure(c.slug, roleSlug);
    if (f) figs.push(f);
  }
  if (figs.length === 0) return null;
  const totalSample = figs.reduce((s, f) => s + f.sampleSize, 0);
  const wMedian = Math.round(
    figs.reduce((s, f) => s + f.monthlyMedian * f.sampleSize, 0) / totalSample
  );
  return {
    label,
    currency: figs[0].currency,
    median: wMedian,
    min: Math.min(...figs.map((f) => f.monthlyMin)),
    max: Math.max(...figs.map((f) => f.monthlyMax)),
    sampleSize: totalSample,
    citiesWithData: figs.length,
  };
}

export async function resolveSides(p: ParsedComparison): Promise<{ left: SideFigure | null; right: SideFigure | null }> {
  if (p.scope === "city") {
    return {
      left: await resolveCity(p.leftSlug, p.role.slug, p.leftLabel),
      right: await resolveCity(p.rightSlug, p.role.slug, p.rightLabel),
    };
  }
  return {
    left: await resolveCountry(p.leftLabel, p.role.slug, p.leftLabel),
    right: await resolveCountry(p.rightLabel, p.role.slug, p.rightLabel),
  };
}

// ─── Salary delta ─────────────────────────────────────────────────────────────

export interface SalaryDelta {
  higher: "left" | "right" | "equal";
  absoluteDiff: number;
  percentDiff: number;
  sameCurrency: boolean;
  note?: string;
}

export function computeDelta(left: SideFigure, right: SideFigure): SalaryDelta {
  const sameCurrency = left.currency === right.currency;
  if (!sameCurrency) {
    return {
      higher: "equal", absoluteDiff: 0, percentDiff: 0, sameCurrency: false,
      note: `${left.currency} and ${right.currency} are different currencies. We show each in local currency; real-terms value depends on local living costs.`,
    };
  }
  const hi = Math.max(left.median, right.median);
  const lo = Math.min(left.median, right.median);
  const higher = left.median === right.median ? "equal" : (left.median > right.median ? "left" : "right");
  return {
    higher,
    absoluteDiff: hi - lo,
    percentDiff: lo === 0 ? 0 : Math.round(((hi - lo) / lo) * 1000) / 10,
    sameCurrency: true,
  };
}

// ─── Context adapters (GATED — supply real data or get honest fallback copy) ──

export interface CostIndex { label: string; index: number; }
export async function getCostOfLivingIndex(_placeSlug: string): Promise<CostIndex | null> {
  return null; // wire to cost-of-living data when available
}

export interface DemandSignal { label: string; postings?: number; trend?: "rising" | "steady" | "cooling"; }
export async function getHiringDemand(_placeSlug: string, _roleSlug: string): Promise<DemandSignal | null> {
  return null; // wire to Jobs table posting counts when available
}

// ─── Which comparison pages exist ────────────────────────────────────────────
// Wave 1: same-currency pairs first (full % hook), then cross-currency.
// Only emits a page when BOTH sides resolve to real data.

export async function getComparisonPaths(): Promise<Array<{ comparison: string }>> {
  const candidates: Array<[string, Scope, string, string]> = [
    // Same-currency UAE pairs (AED vs AED — full % hook now)
    ["software-engineer",        "city", "dubai",   "abu-dhabi"],
    ["senior-software-engineer", "city", "dubai",   "abu-dhabi"],
    ["product-manager",          "city", "dubai",   "abu-dhabi"],
    ["marketing-manager",        "city", "dubai",   "abu-dhabi"],
    ["finance-manager",          "city", "dubai",   "abu-dhabi"],
    ["accountant",               "city", "dubai",   "abu-dhabi"],
    ["software-engineer",        "city", "dubai",   "sharjah"],
    ["accountant",               "city", "dubai",   "sharjah"],
    // Same-currency KSA pairs (SAR vs SAR — full % hook now)
    ["software-engineer",        "city", "riyadh",  "jeddah"],
    ["product-manager",          "city", "riyadh",  "jeddah"],
    ["accountant",               "city", "riyadh",  "jeddah"],
    ["marketing-manager",        "city", "riyadh",  "jeddah"],
    // Cross-country pairs (honest different-currency copy; PPP layer to unlock % later)
    ["software-engineer",        "city", "dubai",   "riyadh"],
    ["software-engineer",        "city", "dubai",   "doha"],
    ["product-manager",          "city", "dubai",   "riyadh"],
    ["accountant",               "country", "uae",  "saudi"],
    ["marketing-manager",        "country", "uae",  "saudi"],
    ["finance-manager",          "city", "dubai",   "doha"],
    ["software-engineer",        "country", "uae",  "saudi"],
  ];

  const live: Array<{ comparison: string }> = [];
  for (const [roleSlug, scope, a, b] of candidates) {
    const role = roleBySlug(roleSlug);
    if (!role) continue;
    const slug = `${roleSlug}-salary-${a}-vs-${b}`;
    const parsed = parseComparisonSlug(slug);
    if (!parsed) continue;
    const { left, right } = await resolveSides(parsed);
    if (left && right) live.push({ comparison: slug });
  }
  return live;
}

// ─── Citation summary (designed to be lifted verbatim by LLMs) ───────────────

export function buildCitationSummary(
  p: ParsedComparison,
  left: SideFigure,
  right: SideFigure,
  delta: SalaryDelta
): string {
  if (!delta.sameCurrency) {
    return (
      `A ${p.role.name} earns a median of ${left.currency} ${left.median.toLocaleString()}/month ` +
      `in ${left.label} and ${right.currency} ${right.median.toLocaleString()}/month in ${right.label} ` +
      `(2026, Addify GCC salary data). The two are in different currencies; real-terms value depends on local costs.`
    );
  }
  if (delta.higher === "equal") {
    return (
      `A ${p.role.name} earns a similar median (~${left.currency} ${left.median.toLocaleString()}/month) ` +
      `in both ${left.label} and ${right.label} as of 2026, based on Addify GCC salary data.`
    );
  }
  const hi = delta.higher === "left" ? left : right;
  const lo = delta.higher === "left" ? right : left;
  return (
    `As of 2026, a ${p.role.name} earns more in ${hi.label} ` +
    `(median ${hi.currency} ${hi.median.toLocaleString()}/month) ` +
    `than in ${lo.label} (${lo.currency} ${lo.median.toLocaleString()}/month) – ` +
    `about ${delta.percentDiff}% higher. Based on Addify GCC salary data (${hi.currency}).`
  );
}

// Re-export types for use in pages and schema
export type { City, Role };
export { ROLES, CITIES, cityBySlug, roleBySlug };
