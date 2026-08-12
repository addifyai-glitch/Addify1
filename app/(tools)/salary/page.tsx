import type { Metadata } from "next";
import SalaryForm from "./SalaryForm";

export const metadata: Metadata = {
  title: "GCC Salary Check | Know What You're Worth",
  description:
    "Free salary benchmarks for 120+ roles across 34 cities in the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and Egypt. Know what your role pays.",
  alternates: { canonical: "/salary" },
};

// SoftwareApplication schema for the tool itself, matching the pattern
// already used on /tools/gratuity-calculator. Organization identity is
// already covered by the homepage's own JSON-LD — not duplicated here.
// This page has no default role/city selected (SalaryForm is client-driven,
// nothing rendered until a user picks a role), so there is no per-result
// MonetaryAmountDistribution to emit here — that already exists, built from
// real computed min/median/max, on every /salary/[jobSlug]/[citySlug] page.
const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Addify GCC Salary Check",
  url: "https://addify.ae/salary",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description:
    "Free salary benchmarks for 120+ roles across 34 cities in the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and Egypt.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@type": "Organization", name: "Addify", url: "https://addify.ae" },
};

export default function SalaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
      />
      {/* Page header */}
      <div className="mb-10 text-center">
        <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Salary Check
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight">
          What does this role pay in the Gulf?
        </h1>
        <p className="mt-3 text-base text-foreground/75 max-w-xl mx-auto">
          Select your job title, city, and experience level. We&apos;ll show you
          the median salary, percentile range, and a typical total package
          breakdown, all in local currency.
        </p>
      </div>

      <SalaryForm />
    </div>
  );
}
