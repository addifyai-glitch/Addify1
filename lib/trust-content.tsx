// lib/trust-content.tsx
// Single source of truth for facts on trust/methodology pages.
// All values reflect what is actually true for Addify — no aspirational numbers.

export const TRUST = {
  cityCount: 9,
  countryCount: 6,
  roleCount: 25,
  countries: "the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman",
  // No user submissions yet — data comes from 3 published salary reports
  totalSubmissions: null as number | null,
  sourceCount: 3,
  sources: [
    "Bayt Salary Report 2024",
    "Robert Half GCC Salary Guide",
    "Cooper Fitch GCC Salary Survey",
  ] as const,
  updateFrequency:
    "Salary ranges are reviewed annually when new editions of our reference reports are published. Current figures reflect the 2024–2025 GCC market.",
  dataEmail: "hello@addify.ae",
} as const;

export const CONFIDENCE_TIERS = [
  {
    label: "High",
    rule: "Consistent across all 3 source reports",
    note: "All current published ranges meet this standard.",
  },
  {
    label: "Medium",
    rule: "Moderate variation between reports",
    note: "Directionally reliable; verify for high-stakes decisions.",
  },
  {
    label: "Low",
    rule: "Insufficient source coverage for this market",
    note: "We do not publish figures at this level.",
  },
];

const SITE = "https://addify.ae";

export function articleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  lastReviewed: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    dateModified: opts.lastReviewed,
    author: { "@type": "Organization", name: "Addify" },
    publisher: { "@type": "Organization", name: "Addify", url: SITE },
    mainEntityOfPage: opts.url,
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function Schema({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((b, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }}
        />
      ))}
    </>
  );
}
