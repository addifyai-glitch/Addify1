import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "@/components/layout/trust-page";
import { TRUST, Schema, articleSchema } from "@/lib/trust-content";

const PAGE_URL = "https://addify.ae/data-sources";
const LAST_REVIEWED = "2026-06-22";

export const metadata: Metadata = {
  title: "Data Sources",
  description:
    "The three published GCC salary reports that power Addify's salary benchmarks, and exactly how each is used.",
  alternates: { canonical: PAGE_URL },
};

const SOURCES = [
  {
    name: "Bayt Salary Report 2024",
    publisher: "Bayt.com",
    type: "Annual MENA salary survey",
    coverage:
      "30,000+ professionals across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and broader MENA. Covers 100+ roles across all major job functions.",
    usedFor:
      "Primary base salary benchmarks across all experience bands, especially for mid-level professional roles.",
    notes:
      "Largest single sample source. Respondents are self-selected via the Bayt platform, which skews toward active jobseekers.",
  },
  {
    name: "Robert Half GCC Salary Guide",
    publisher: "Robert Half International",
    type: "Annual recruiter salary guide",
    coverage:
      "UAE and broader Gulf focus. Stronger depth in finance, accounting, technology, and legal roles. Based on employer and candidate data collected by Robert Half recruiters.",
    usedFor:
      "Validation of professional and specialist role ranges; particularly strong for finance and technology bands.",
    notes:
      "Reflects market rates as seen by a specialist recruiter. May run slightly higher than broader surveys for in-demand roles.",
  },
  {
    name: "Cooper Fitch GCC Salary Survey",
    publisher: "Cooper Fitch Executive Search",
    type: "Annual executive search salary report",
    coverage:
      "UAE, Saudi Arabia, and wider GCC. Deep coverage of senior management, executive, and C-suite roles. Draws on Cooper Fitch's own placement and candidate data.",
    usedFor:
      "Senior and management-level salary validation; regional context for director and above bands.",
    notes:
      "Executive search focus means stronger signal at senior levels; less coverage for entry-level roles.",
  },
];

export default function DataSourcesPage() {
  const schema = articleSchema({
    headline: "Addify Salary Data Sources",
    description:
      "The three published GCC salary reports that power Addify's salary benchmarks.",
    url: PAGE_URL,
    lastReviewed: LAST_REVIEWED,
  });

  return (
    <>
      <Schema data={schema} />
      <TrustPage
        eyebrow="Data Sources"
        title="Where the numbers come from"
        intro="Every salary range on Addify traces back to one of three published annual GCC market reports. Here is which ones, why we chose them, and what each contributes."
        lastReviewed={LAST_REVIEWED}
      >
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Why three reports, not one
          </h2>
          <p>
            Any single salary survey has blind spots — in sector coverage, respondent type,
            or regional focus. Cross-referencing three independent sources lets us identify
            where the market broadly agrees (higher confidence) and where there is meaningful
            spread (which we reflect in the published range rather than hiding it).
          </p>
          <p className="mt-3">
            We do not weight one report over another by default. Where all three align
            closely, the published range is narrow. Where they diverge, the range widens to
            represent the honest spread of market rates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-5">
            The three sources
          </h2>
          <div className="space-y-6">
            {SOURCES.map((s, i) => (
              <div
                key={s.name}
                className="rounded-xl border border-border p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.publisher} · {s.type}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-accent bg-accent/10 rounded-full px-2.5 py-0.5">
                    Source {i + 1}
                  </span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-foreground">Coverage</dt>
                    <dd className="text-muted-foreground mt-0.5">{s.coverage}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">How we use it</dt>
                    <dd className="text-muted-foreground mt-0.5">{s.usedFor}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Known limitations</dt>
                    <dd className="text-muted-foreground mt-0.5">{s.notes}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What we do not use
          </h2>
          <p>
            We do not incorporate individual self-reported salary submissions at this stage.
            We plan to add that layer as submission volume grows to a point where it is
            statistically meaningful. When we do, submissions will be clearly labelled as a
            separate source type on each page.
          </p>
          <p className="mt-3">
            We also do not scrape job postings for salary data. Posted salary ranges reflect
            what employers are willing to advertise, not what they are willing to pay — these
            are different numbers, and combining them without disclosure would be misleading.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            City adjustments
          </h2>
          <p>
            The three source reports focus on the Gulf&rsquo;s largest markets. For the{" "}
            {TRUST.cityCount} cities Addify covers, we apply a published regional
            adjustment factor where a city is not directly covered by all three reports.
            These factors are derived from regional compensation data and calibrated against
            the cities that are fully covered.
          </p>
          <p className="mt-3">
            City-adjusted figures are still based on the same three source reports — we do
            not invent numbers for a city because it is on our list.
          </p>
        </section>

        <nav aria-label="Related" className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Related</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                How we calculate salary estimates →
              </Link>
            </li>
            <li>
              <Link href="/about-our-data" className="text-accent hover:underline underline-offset-2">
                About our data: samples, freshness, confidence →
              </Link>
            </li>
          </ul>
        </nav>
      </TrustPage>
    </>
  );
}
