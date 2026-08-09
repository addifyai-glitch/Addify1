import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "@/components/layout/trust-page";
import { TRUST, Schema, articleSchema } from "@/lib/trust-content";

const PAGE_URL = "https://addify.ae/editorial-policy";
const LAST_REVIEWED = "2026-06-22";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How Addify reviews salary data, handles corrections, uses AI tools, and maintains editorial independence.",
  alternates: { canonical: PAGE_URL },
};

export default function EditorialPolicyPage() {
  const schema = articleSchema({
    headline: "Addify Editorial Policy",
    description:
      "How Addify reviews salary data, handles corrections, and maintains editorial independence.",
    url: PAGE_URL,
    lastReviewed: LAST_REVIEWED,
  });

  return (
    <>
      <Schema data={schema} />
      <TrustPage
        eyebrow="Editorial Policy"
        title="How we review, update, and correct"
        intro="The standards that govern what Addify publishes and how we respond when something is wrong."
        lastReviewed={LAST_REVIEWED}
      >
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What this policy covers
          </h2>
          <p>
            This policy applies to all salary benchmarks, data pages, and editorial content
            published on Addify. It governs how we fact-check figures before publishing,
            how we handle corrections once something is live, and what role AI tools play in
            our editorial process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Fact-checking salary data
          </h2>
          <p>
            Every salary figure on Addify is cross-referenced across{" "}
            <strong>{TRUST.sourceCount} independent published GCC salary reports</strong>{" "}
            before being published. A figure is only published where all three sources
            provide data for that role and city. Where the sources agree closely, we publish
            a narrow range. Where they diverge, we publish a wider range that honestly
            represents market spread — we do not average away disagreement.
          </p>
          <p className="mt-3">
            City adjustment factors — applied where a city is not directly covered by all
            three source reports — are derived from published regional compensation data and
            reviewed annually. These are estimates, and we label them as such.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Review and update cadence
          </h2>
          <p>
            Salary benchmarks are reviewed annually when new editions of our three reference
            reports are published. Figures are not updated mid-year unless a source
            correction is issued by the original publisher. The &ldquo;last updated&rdquo;
            date on each salary page reflects when the underlying data was last refreshed,
            not when the page was last edited.
          </p>
          <p className="mt-3">
            Blog and editorial content is reviewed on a rolling basis. Articles that contain
            salary figures are updated to remain consistent with current benchmark data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Corrections policy
          </h2>
          <p>
            We treat corrections seriously. If you believe a figure on Addify is
            materially wrong — either because it diverges from your direct market
            experience or because you have identified an error in our source handling —
            please contact us at{" "}
            <a
              href={`mailto:${TRUST.dataEmail}`}
              className="text-accent underline underline-offset-2"
            >
              {TRUST.dataEmail}
            </a>
            .
          </p>
          <p className="mt-3">
            We will investigate within 5 business days and publish a correction if
            warranted. Corrections are noted on the relevant page with the updated date.
            We do not quietly edit figures without noting that a correction has been made.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">AI tools policy</h2>
          <p>
            <strong>Salary data pages</strong> — figures, ranges, and structured data are
            computed algorithmically from published source reports. No AI generates or
            alters the underlying numbers.
          </p>
          <p className="mt-3">
            <strong>Editorial and blog content</strong> — we may use AI writing assistance
            (including Claude) as a drafting tool. All AI-assisted content is reviewed,
            edited, and fact-checked by a human editor before publication. We do not
            publish AI-generated claims about salary figures without manual verification
            against our source data.
          </p>
          <p className="mt-3">
            We do not use AI to generate citations, attribute quotes, or invent sources.
            Every source listed on Addify is a real, named publication we have directly
            referenced.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Editorial independence
          </h2>
          <p>
            Addify earns revenue from employer job listings and may earn from advertising.
            Neither affects how salary figures are calculated or which roles and cities we
            cover. Employers who post jobs on Addify have no influence over the salary
            benchmarks shown on the platform.
          </p>
          <p className="mt-3">
            We do not accept payment to feature, remove, or adjust salary ranges. If an
            employer believes a benchmark for their sector is wrong, they can submit a
            correction through the same public process as anyone else.
          </p>
        </section>

        <nav aria-label="Related" className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Related</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                Methodology: how salary estimates are calculated →
              </Link>
            </li>
            <li>
              <Link href="/data-sources" className="text-accent hover:underline underline-offset-2">
                Data sources: which reports we use →
              </Link>
            </li>
            <li>
              <Link href="/about-our-data" className="text-accent hover:underline underline-offset-2">
                About our data: at a glance →
              </Link>
            </li>
          </ul>
        </nav>
      </TrustPage>
    </>
  );
}
