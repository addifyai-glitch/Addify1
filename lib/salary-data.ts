// lib/salary-data.ts
// Data adapter for programmatic salary pages.
// Backed by salaries.json (Bayt/Robert Half/Cooper Fitch data). There is no
// live user-submission source — the salary submission feature was removed.

import salariesJson from "@/data/salaries.json";

const salaries = salariesJson as {
  cityFactors: Record<string, { name: string; country: string; currency: string; factor: number }>;
  roles: Record<string, {
    title: string;
    category: string;
    base: Record<string, { p25: number; median: number; p75: number; housing: number; total: number }>;
  }>;
};

export interface SalaryBand {
  experience: string;
  min: number;
  median: number;
  max: number;
}

export interface SalaryRecord {
  citySlug: string;
  roleSlug: string;
  currency: string;
  bands: SalaryBand[];
  sampleSize: number;
  lastUpdatedISO: string;
  housingPct?: number;
  transportPct?: number;
}

// Minimum data points required before a page is published.
// Prevents thin / low-confidence pages that could be flagged as doorway spam.
export const MIN_SAMPLE = 1;

const BAND_MAP: Record<string, string> = {
  "0-2":  "0–2 years",
  "3-5":  "3–5 years",
  "6-10": "6–10 years",
  "10+":  "10+ years",
};

function roundForCurrency(value: number, currency: string): number {
  const nearest = ["KWD", "BHD", "OMR"].includes(currency) ? 25 : 500;
  return Math.round(value / nearest) * nearest;
}

export async function getSalaryRecord(
  citySlug: string,
  roleSlug: string
): Promise<SalaryRecord | null> {
  const city = salaries.cityFactors[citySlug];
  const role = salaries.roles[roleSlug];
  if (!city || !role) return null;

  const bands: SalaryBand[] = Object.entries(role.base)
    .filter(([band]) => BAND_MAP[band])
    .map(([band, data]) => ({
      experience: BAND_MAP[band],
      min:    roundForCurrency(data.p25    * city.factor, city.currency),
      median: roundForCurrency(data.median * city.factor, city.currency),
      max:    roundForCurrency(data.p75    * city.factor, city.currency),
    }));

  if (bands.length < MIN_SAMPLE) return null;

  const ref = role.base["3-5"] ?? role.base[Object.keys(role.base)[0]];

  return {
    citySlug,
    roleSlug,
    currency: city.currency,
    bands,
    // 3 = number of published salary reports used as sources
    // (Bayt Salary Report, Robert Half GCC Guide, Cooper Fitch GCC Survey)
    sampleSize: 3,
    lastUpdatedISO: "2025-01-01T00:00:00Z",
    housingPct:    ref?.housing,
    transportPct:  undefined,
  };
}

// Returns only (city, role) pairs that have real publishable data.
// Start with high-value combos; expand in waves once indexation is proven.
export async function getSalaryPaths(): Promise<Array<{ city: string; role: string }>> {
  const cities = Object.keys(salaries.cityFactors);
  const roles  = Object.keys(salaries.roles);

  const live: Array<{ city: string; role: string }> = [];
  for (const city of cities) {
    for (const role of roles) {
      const rec = await getSalaryRecord(city, role);
      if (rec && rec.sampleSize >= MIN_SAMPLE) live.push({ city, role });
    }
  }
  return live;
}
