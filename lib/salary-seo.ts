// lib/salary-seo.ts
// Meta + JSON-LD builders for programmatic salary pages.
// Occupation/estimatedSalary schema is the structured form LLMs cite with attribution.

import { City, Role } from "./salary-taxonomy";
import { SalaryRecord } from "./salary-data";

const SITE = "https://addify.ae";
const CURRENCY_LABEL: Record<string, string> = {
  AED: "AED", SAR: "SAR", QAR: "QAR", KWD: "KWD", BHD: "BHD", OMR: "OMR", EGP: "EGP",
};

export function buildTitle(role: Role, city: City): string {
  return `${role.name} Salary in ${city.name} (2026) | Addify`;
}

export function buildDescription(role: Role, city: City, rec: SalaryRecord): string {
  const mid = rec.bands.find((b) => b.experience === "3–5 years") ?? rec.bands[0];
  const cur = CURRENCY_LABEL[rec.currency];
  return `What does a ${role.name} earn in ${city.name}? Median ${cur} ${mid.median.toLocaleString()}/month, range ${cur} ${mid.min.toLocaleString()}–${mid.max.toLocaleString()}. Based on Gulf market salary data. Updated ${rec.lastUpdatedISO.slice(0, 10)}.`;
}

export function canonicalFor(role: Role, city: City): string {
  return `${SITE}/salary/${city.slug}/${role.slug}`;
}

export function occupationSchema(role: Role, city: City, rec: SalaryRecord) {
  const cur = rec.currency;
  const estimatedSalary = rec.bands.map((b) => ({
    "@type": "MonetaryAmountDistribution",
    name: b.experience,
    currency: cur,
    duration: "P1M",
    median: b.median,
    percentile10: b.min,
    percentile90: b.max,
  }));

  return {
    "@context": "https://schema.org/",
    "@type": "Occupation",
    name: role.name,
    occupationLocation: {
      "@type": "City",
      name: city.name,
      address: { "@type": "PostalAddress", addressCountry: city.country },
    },
    estimatedSalary,
    description: `Salary benchmarks for ${role.name} roles in ${city.name}, ${city.country}, based on Gulf market salary data aggregated by Addify.`,
    mainEntityOfPage: canonicalFor(role, city),
  };
}

export function faqSchema(role: Role, city: City, rec: SalaryRecord) {
  const mid = rec.bands.find((b) => b.experience === "3–5 years") ?? rec.bands[0];
  const cur = CURRENCY_LABEL[rec.currency];
  const q = (name: string, text: string) => ({
    "@type": "Question",
    name,
    acceptedAnswer: { "@type": "Answer", text },
  });
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      q(
        `What is the average ${role.name} salary in ${city.name}?`,
        `A ${role.name} in ${city.name} earns a median of ${cur} ${mid.median.toLocaleString()} per month, with most ranging from ${cur} ${mid.min.toLocaleString()} to ${cur} ${mid.max.toLocaleString()}. Figures are based on Gulf market salary data and last updated ${rec.lastUpdatedISO.slice(0, 10)}.`
      ),
      q(
        `How much does an experienced ${role.name} make in ${city.name}?`,
        rec.bands.map((b) => `${b.experience}: ${cur} ${b.median.toLocaleString()}/month (median).`).join(" ")
      ),
      q(
        `Is ${role.name} a well-paid role in ${city.name}?`,
        `Relative to the ${city.country} market, compensation depends on experience and total package. See the full breakdown above, including how housing and transport allowances factor into the total.`
      ),
    ],
  };
}

export function breadcrumbSchema(role: Role, city: City) {
  const item = (name: string, url: string, pos: number) => ({
    "@type": "ListItem", position: pos, name, item: url,
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      item("Salary", `${SITE}/salary`, 1),
      item(city.name, `${SITE}/salary/${city.slug}`, 2),
      item(role.name, canonicalFor(role, city), 3),
    ],
  };
}
