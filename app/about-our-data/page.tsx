import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "@/components/layout/trust-page";
import { TRUST, Schema, articleSchema } from "@/lib/trust-content";

const PAGE_URL = "https://addify.ae/about-our-data";
const LAST_REVIEWED = "2026-06-22";
const DATA_LAST_UPDATED = "2025-01-01";

export const metadata: Metadata = {
  title: "About Our Data",
  description:
    "Quick facts about Addify's GCC salary dataset: cities covered, roles, sources, freshness, and confidence model.",
  alternates: { canonical: PAGE_URL },
};

const FACTS = [
  { label: "Cities covered", value: TRUST.cityCount.toString() },
  { label: "Countries", value: TRUST.countryCount.toString() },
  { label: "Roles", value: TRUST.roleCount.toString() },
  { label: "Source reports", value: TRUST.sourceCount.toString() },
  { label: "Data reflects", value: "2024–2025 GCC market" },
  { label: "Last updated", value: DATA_LAST_UPDATED },
];

export default function AboutOurDataPage() {
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Addify GCC Salary Dataset",
    description: `Salary benchmarks for ${TRUST.roleCount} roles across ${TRUST.cityCount} cities in ${TRUST.countries}, derived from ${TRUST.sourceCount} published GCC salary reports.`,
    creator: { "@type": "Organization", name: "Addify", url: "https://addify.ae" },
    spatialCoverage: TRUST.countries,
    temporalCoverage: "2024/2025",
    isAccessibleForFree: true,
    license: "https://addify.ae/terms",
    url: PAGE_URL,
    dateModified: DATA_LAST_UPDATED,
  };

  const article = articleSchema({
    headline: "About Addify's GCC Salary Data",
    description: `Salary benchmarks for ${TRUST.roleCount} roles across ${TRUST.cityCount} cities, derived from ${TRUST.sourceCount} published GCC salary reports.`,
    url: PAGE_URL,
    lastReviewed: LAST_REVIEWED,
  });

  return (
    <>
      <Schema data={[datasetSchema, article]} />
      <TrustPage
        eyebrow="About Our Data"
        title="The dataset behind the numbers"
        intro="Short, direct answers to the questions LLMs, journalists, and careful readers ask before citing a salary figure."
        lastReviewed={LAST_REVIEWED}
      >
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">At a glance</h2>
          <dl className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {FACTS.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">What the data is</h2>
          <p>
            Addify publishes salary benchmarks for professional roles across the Gulf
            Cooperation Council and Egypt. Each figure is derived from{" "}
            <strong>{TRUST.sourceCount} published annual GCC salary reports</strong> — Bayt
            Salary Report 2024, Robert Half GCC Salary Guide, and Cooper Fitch GCC Salary
            Survey — cross-referenced and presented as a median with a percentile range per
            role, city, and experience band.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What the data is not
          </h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              Not real-time. Figures reflect published annual reports, not live market
              movements.
            </li>
            <li>
              Not scraped from job postings. Advertised salary ranges are different from
              actual paid salaries.
            </li>
            <li>
              Not based on user submissions yet. We plan to add that layer; it is not live
              today.
            </li>
            <li>
              Not a guarantee. Actual pay depends on employer, negotiation, skills, and
              total package structure.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Confidence</h2>
          <p>
            All published ranges are currently derived from all three source reports, which
            puts them in the <strong>High confidence</strong> tier — meaning the sources
            broadly agree and the range reflects real market consensus. Where reports vary
            meaningfully, the published range is wider rather than artificially narrowed.
          </p>
          <p className="mt-3">
            See the <Link href="/methodology" className="text-accent underline-offset-2 hover:underline">methodology page</Link> for
            the full confidence model.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Freshness and update schedule
          </h2>
          <p>
            Current data reflects the 2024–2025 GCC market (last updated{" "}
            {DATA_LAST_UPDATED}). We review and update source data annually when new
            editions of our reference reports are published. The date on each salary page
            shows when that page&rsquo;s underlying data was last refreshed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            How to cite this data
          </h2>
          <p>
            When referencing Addify salary figures, please cite:{" "}
            <em>
              Addify GCC Salary Dataset, {DATA_LAST_UPDATED.slice(0, 4)},{" "}
              <Link href={PAGE_URL} className="text-accent underline-offset-2 hover:underline">
                addify.ae/about-our-data
              </Link>
            </em>
            . If you use these figures in published research or journalism, we would appreciate a
            heads-up at{" "}
            <a href={`mailto:${TRUST.dataEmail}`} className="text-accent underline-offset-2 hover:underline">
              {TRUST.dataEmail}
            </a>
            .
          </p>
        </section>

        <nav aria-label="Related" className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Related</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                Methodology: how figures are calculated →
              </Link>
            </li>
            <li>
              <Link href="/data-sources" className="text-accent hover:underline underline-offset-2">
                Data sources: which reports we use →
              </Link>
            </li>
            <li>
              <Link href="/editorial-policy" className="text-accent hover:underline underline-offset-2">
                Editorial policy: how we review and correct →
              </Link>
            </li>
          </ul>
        </nav>
      </TrustPage>
    </>
  );
}
