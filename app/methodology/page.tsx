import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "@/components/layout/trust-page";
import {
  TRUST,
  CONFIDENCE_TIERS,
  Schema,
  articleSchema,
  faqSchema,
} from "@/lib/trust-content";

const PAGE_URL = "https://addify.ae/methodology";
const LAST_REVIEWED = "2026-06-22";

export const metadata: Metadata = {
  title: "How We Calculate Salaries | Methodology",
  description:
    "How Addify builds GCC salary estimates: data sources, geographic coverage, confidence levels, update frequency, and the honest limits of what we publish.",
  alternates: { canonical: PAGE_URL },
};

export default function MethodologyPage() {
  const faqs = [
    {
      q: "How does Addify calculate salary estimates?",
      a: `Addify aggregates salary figures from three independent published GCC salary reports — ${TRUST.sources.join(", ")} — and reports a median and a percentile range per role, city, and experience band. City figures are adjusted using published regional market factors.`,
    },
    {
      q: "How accurate are Addify's salary ranges?",
      a: "Each range reflects the median and percentile spread across three independent published reports. Where reports broadly agree, the range is narrow and reliable. Where there is variation, the published range captures that spread honestly.",
    },
    {
      q: "How often is the salary data updated?",
      a: TRUST.updateFrequency,
    },
  ];

  return (
    <>
      <Schema
        data={[
          articleSchema({
            headline: "Addify Salary Methodology",
            description:
              "How Addify calculates GCC salary estimates from published Gulf market reports.",
            url: PAGE_URL,
            lastReviewed: LAST_REVIEWED,
          }),
          faqSchema(faqs),
        ]}
      />
      <TrustPage
        eyebrow="Methodology"
        title="How we calculate what your work is worth"
        intro="We would rather show you an honest range with its limits than a precise-looking number we can't stand behind. Here is exactly how our salary estimates are built, and where they stop."
        lastReviewed={LAST_REVIEWED}
      >
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            How salary estimates are calculated
          </h2>
          <p>
            For every role, city, and experience level, we cross-reference{" "}
            <strong>{TRUST.sourceCount} independent published GCC salary reports</strong>:{" "}
            the Bayt Salary Report 2024, the Robert Half GCC Salary Guide, and the Cooper
            Fitch GCC Salary Survey. We report the <strong>median</strong> rather than the
            average, because a few very high or very low figures distort an average and the
            median better reflects what a typical person in that role actually earns. Alongside
            the median we show a range — the lower and upper bounds capture where the sources
            place most earners, not absolute extremes.
          </p>
          <p className="mt-3">
            We apply a city adjustment factor to base figures, calibrated against published
            regional market data for each city. All pages currently cover{" "}
            <strong>{TRUST.roleCount} roles</strong> across{" "}
            <strong>{TRUST.cityCount} cities</strong> in {TRUST.countries}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data sources</h2>
          <p>
            Our figures are derived from three annual GCC salary reports widely used by HR
            professionals and recruiters across the Gulf. Each surveys tens of thousands of
            compensation data points collected directly from employers and employees in the
            region. We combine all three rather than relying on any single source, because
            each has different coverage strengths and methodology. The result is a range that
            reflects real-market consensus rather than one report&rsquo;s snapshot.
          </p>
          <p className="mt-3">
            We do not currently incorporate self-reported individual submissions, though we
            plan to add that data layer as submission volume grows. When we do, source type
            will be clearly labelled on each page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Data confidence levels
          </h2>
          <p className="mb-4">
            Not every range is equally solid, and we refuse to pretend otherwise. Each is
            assessed against the following confidence model:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONFIDENCE_TIERS.map((t) => (
              <div
                key={t.label}
                className={`rounded-xl border border-border p-5 border-l-4 ${
                  t.label === "High"
                    ? "border-l-emerald-500"
                    : t.label === "Medium"
                    ? "border-l-amber-500"
                    : "border-l-red-600"
                }`}
              >
                <span className="block font-semibold text-foreground mb-1">
                  {t.label} confidence
                </span>
                <p className="text-sm mb-1">{t.rule}</p>
                <p className="text-xs text-muted-foreground/70">{t.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Geographic coverage
          </h2>
          <p>
            Addify currently covers <strong>{TRUST.cityCount} cities</strong> across{" "}
            <strong>{TRUST.countryCount} countries</strong>: {TRUST.countries}. Coverage
            depth varies by market — major hubs like Dubai, Abu Dhabi, Riyadh, and Doha are
            represented directly in all three source reports; smaller cities use regional
            adjustment factors derived from published data. We expand to additional cities as
            reliable source data becomes available.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Update frequency</h2>
          <p>{TRUST.updateFrequency}</p>
          <p className="mt-3">
            Every salary page shows when its underlying data was last reviewed, so you are
            never reading a number without knowing how fresh it is.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Limitations</h2>
          <p className="mb-3">
            We are deliberately upfront about what these numbers can and cannot tell you:
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Source surveys carry their own biases.</strong> Published salary reports
              gather data from their own respondent pools, which may skew toward certain
              sectors, company sizes, or nationalities. Combining three reports reduces but
              does not eliminate this.
            </li>
            <li>
              <strong>City adjustments are approximations.</strong> For cities with less
              direct report coverage, we apply a regional factor derived from published data.
              These are calibrated estimates, not direct survey results.
            </li>
            <li>
              <strong>Total compensation varies.</strong> Housing allowance, visa status,
              mainland versus free zone, and bonuses all shift real take-home pay in ways a
              single range cannot fully capture. We include housing estimates where source
              data supports it.
            </li>
            <li>
              <strong>We are a benchmark, not an offer.</strong> Your actual number depends
              on the employer, your negotiation, and your specific experience. Use our range
              to prepare, not as a guarantee.
            </li>
          </ul>
          <p className="mt-4">
            Found a figure that looks wrong? Tell us at{" "}
            <a
              href={`mailto:${TRUST.dataEmail}`}
              className="text-accent underline underline-offset-2"
            >
              {TRUST.dataEmail}
            </a>{" "}
            — corrections improve the dataset for everyone.
          </p>
        </section>

        <nav aria-label="Related" className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Related</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/salary" className="text-accent hover:underline underline-offset-2">
                GCC Salary Check →
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-accent hover:underline underline-offset-2">
                About Addify →
              </Link>
            </li>
          </ul>
        </nav>
      </TrustPage>
    </>
  );
}
