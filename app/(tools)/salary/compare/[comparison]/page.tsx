import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  parseComparisonSlug, resolveSides, computeDelta,
  getComparisonPaths, getCostOfLivingIndex, getHiringDemand,
  buildCitationSummary,
  type ParsedComparison, type SideFigure, type SalaryDelta,
} from "@/lib/comparison";
import {
  comparisonUrl, breadcrumbSchema, faqSchema, datasetSchema,
} from "@/lib/comparison-schema";

type Props = { params: Promise<{ comparison: string }> };

export async function generateStaticParams() {
  return getComparisonPaths();
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comparison } = await params;
  const p = parseComparisonSlug(comparison);
  if (!p) return {};
  const { left, right } = await resolveSides(p);
  if (!left || !right) return {};
  const url = comparisonUrl(comparison);
  const title = `${p.role.name} Salary: ${p.leftLabel} vs ${p.rightLabel} (2026) | Addify`;
  const desc =
    `Compare ${p.role.name} salaries in ${p.leftLabel} and ${p.rightLabel}. ` +
    `Median ${left.currency} ${left.median.toLocaleString()} vs ${right.currency} ${right.median.toLocaleString()} per month.`;
  return {
    title, description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { comparison } = await params;
  const p = parseComparisonSlug(comparison);
  if (!p) notFound();

  const { left, right } = await resolveSides(p);
  if (!left || !right) notFound();

  const delta = computeDelta(left, right);
  const [costL, costR] = await Promise.all([
    getCostOfLivingIndex(p.leftSlug), getCostOfLivingIndex(p.rightSlug),
  ]);
  const [demandL, demandR] = await Promise.all([
    getHiringDemand(p.leftSlug, p.role.slug), getHiringDemand(p.rightSlug, p.role.slug),
  ]);

  const schemas = [
    breadcrumbSchema(p, comparison),
    faqSchema(p, left, right, delta),
    datasetSchema(p, left, right, comparison),
  ];

  const citationSummary = buildCitationSummary(p, left, right, delta);

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/salary" className="hover:text-foreground transition-colors">Salary</Link>
          <span>/</span>
          <Link href="/salary/compare" className="hover:text-foreground transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-foreground">{p.role.name}: {p.leftLabel} vs {p.rightLabel}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-8">
          {p.role.name} Salary: {p.leftLabel} vs {p.rightLabel}
        </h1>

        {/* ── AI-citation summary ── */}
        {/* Self-contained, factual, attributed — designed to be lifted by LLMs */}
        <aside
          aria-label="Summary"
          className="mb-10 rounded-xl border-l-4 border-accent bg-accent/5 px-6 py-5"
        >
          <p className="text-base text-foreground leading-relaxed">{citationSummary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Source: Addify GCC salary data ·{" "}
            <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
              methodology
            </Link>
          </p>
        </aside>

        {/* ── Side-by-side cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <SideCard side={left} role={p.role.name} />
          <SideCard side={right} role={p.role.name} />
        </section>

        {/* ── Salary difference ── */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">The difference</h2>
          {delta.sameCurrency ? (
            delta.higher === "equal" ? (
              <p className="text-muted-foreground">
                A {p.role.name} earns roughly the same median in {left.label} and {right.label}.
              </p>
            ) : (
              <p className="text-muted-foreground">
                A {p.role.name} earns about{" "}
                <strong className="text-foreground font-semibold">
                  {left.currency} {delta.absoluteDiff.toLocaleString()}
                </strong>{" "}
                more per month in{" "}
                <strong className="text-foreground font-semibold">
                  {delta.higher === "left" ? left.label : right.label}
                </strong>{" "}
                — roughly{" "}
                <strong className="text-foreground font-semibold">{delta.percentDiff}% higher</strong>{" "}
                at the median.
              </p>
            )
          ) : (
            <p className="text-muted-foreground">{delta.note}</p>
          )}
        </section>

        {/* ── Purchasing power (GATED) ── */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What the money is actually worth
          </h2>
          {costL && costR ? (
            <PurchasingPower left={left} right={right} costL={costL} costR={costR} />
          ) : (
            <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/20 px-5 py-4">
              A higher salary doesn&rsquo;t always mean more disposable income — rent, schooling, and
              transport costs differ across the Gulf. We&rsquo;re building a cost-of-living layer to
              quantify real take-home value; until then, weigh these nominal figures against local
              living costs. See our{" "}
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                methodology
              </Link>{" "}
              for what we do and don&rsquo;t yet measure.
            </p>
          )}
        </section>

        {/* ── Hiring demand (GATED) ── */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">Hiring demand</h2>
          {demandL && demandR ? (
            <HiringDemand
              role={p.role.name}
              left={demandL}
              right={demandR}
              leftLabel={left.label}
              rightLabel={right.label}
            />
          ) : (
            <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/20 px-5 py-4">
              We report hiring demand only where we have a real signal to back it. Demand data for
              this {p.role.name} comparison isn&rsquo;t quantified yet — we won&rsquo;t estimate it. Check{" "}
              <Link href="/jobs" className="text-accent hover:underline underline-offset-2">
                live {p.role.name} roles
              </Link>{" "}
              for a current read.
            </p>
          )}
        </section>

        {/* ── Source salary pages ── */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">The underlying salary data</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={sourceSalaryHref(p, "left")}
                className="text-accent hover:underline underline-offset-2"
              >
                {p.role.name} salary in {left.label} →
              </Link>
            </li>
            <li>
              <Link
                href={sourceSalaryHref(p, "right")}
                className="text-accent hover:underline underline-offset-2"
              >
                {p.role.name} salary in {right.label} →
              </Link>
            </li>
          </ul>
        </section>

        {/* ── Related research ── */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">Related research</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/research" className="text-accent hover:underline underline-offset-2">
                GCC salary &amp; hiring research →
              </Link>
            </li>
            <li>
              <Link
                href="/research/uae-salary-report-2026"
                className="text-accent hover:underline underline-offset-2"
              >
                UAE Salary Report 2026 →
              </Link>
            </li>
            <li>
              <Link
                href="/research/saudi-arabia-salary-report-2026"
                className="text-accent hover:underline underline-offset-2"
              >
                Saudi Arabia Salary Report 2026 →
              </Link>
            </li>
          </ul>
        </section>

        {/* ── Funnel ── */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-1">
            Check your specific number
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Select your exact role, city, and experience level in the Salary Check tool.
          </p>
          <Link href="/salary" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Run the Salary Check →
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SideCard({ side, role }: { side: SideFigure; role: string }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-3">{side.label}</h2>
      <p className="text-3xl font-display text-foreground mb-0.5">
        {side.currency} {side.median.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground mb-3">median / month</p>
      <p className="text-sm text-muted-foreground mb-1">
        Range: {side.currency} {side.min.toLocaleString()}–{side.max.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">
        {role} · mid-seniority (3–5 yrs)
        {side.citiesWithData ? ` · ${side.citiesWithData} cities` : ""}
      </p>
    </div>
  );
}

function PurchasingPower({
  left, right,
  costL, costR,
}: {
  left: SideFigure; right: SideFigure;
  costL: { index: number }; costR: { index: number };
}) {
  const realL = Math.round(left.median / (costL.index / 100));
  const realR = Math.round(right.median / (costR.index / 100));
  const higher = realL === realR ? null : realL > realR ? left : right;
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <p>
        Adjusted for local living costs, {left.label} is worth about {left.currency}{" "}
        {realL.toLocaleString()} and {right.label} about {right.currency} {realR.toLocaleString()} in
        real terms.
      </p>
      {higher && (
        <p>
          On a cost-adjusted basis,{" "}
          <strong className="text-foreground">{higher.label}</strong> leaves more in your pocket,
          even where the headline salary is similar.
        </p>
      )}
    </div>
  );
}

function HiringDemand({
  role, left, right, leftLabel, rightLabel,
}: {
  role: string;
  left: { postings?: number; trend?: string };
  right: { postings?: number; trend?: string };
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {leftLabel}: {left.postings ?? "—"} active {role} postings
      {left.trend ? ` (${left.trend})` : ""}. {rightLabel}: {right.postings ?? "—"} active
      {right.trend ? ` (${right.trend})` : ""}.
    </p>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sourceSalaryHref(p: ParsedComparison, side: "left" | "right"): string {
  const slug = side === "left" ? p.leftSlug : p.rightSlug;
  if (p.scope === "city") return `/salary/${p.role.slug}/${slug}`;
  return `/salary/${slug}`;
}
