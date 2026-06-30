// Single accessor for all salary figures on the site.
// Every surface — reports, tools, programmatic pages — reads through this
// function so a salary number can only disagree with itself if getSalaryRecord
// disagrees with itself.

import { getSalaryRecord } from "@/lib/salary-data";

export interface SalaryFigure {
  role: string;
  city: string;
  currency: string;
  monthlyMin: number;
  monthlyMedian: number;
  monthlyMax: number;
  experience: string;
  sampleSize: number;
  lastUpdatedISO: string;
}

export async function getSalaryFigure(
  citySlug: string,
  roleSlug: string,
  experience?: string
): Promise<SalaryFigure | null> {
  const rec = await getSalaryRecord(citySlug, roleSlug);
  if (!rec) return null;

  const band = experience
    ? (rec.bands.find((b) => b.experience === experience) ?? rec.bands[0])
    : (rec.bands.find((b) => b.experience === "3–5 years") ?? rec.bands[0]);

  if (!band) return null;

  return {
    role: roleSlug,
    city: citySlug,
    currency: rec.currency,
    monthlyMin: band.min,
    monthlyMedian: band.median,
    monthlyMax: band.max,
    experience: band.experience,
    sampleSize: rec.sampleSize,
    lastUpdatedISO: rec.lastUpdatedISO,
  };
}
