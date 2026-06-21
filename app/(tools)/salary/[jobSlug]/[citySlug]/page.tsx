import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ROLE_SLUGS,
  CITY_SLUGS,
  ROLES,
  CITY_CONFIGS,
  EXPERIENCE_BANDS,
  EXPERIENCE_LABELS_LONG,
  computeSalary,
  formatCurrency,
  buildMetaTitle,
  buildMetaDescription,
  type SalaryResult,
} from "@/lib/salary";

type Params = { jobSlug: string; citySlug: string };

export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const jobSlug of ROLE_SLUGS) {
    for (const citySlug of CITY_SLUGS) {
      params.push({ jobSlug, citySlug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { jobSlug, citySlug } = await params;
  const role = ROLES[jobSlug];
  const city = CITY_CONFIGS[citySlug];
  if (!role || !city) return {};

  const allBands = EXPERIENCE_BANDS
    .map((exp) => computeSalary(jobSlug, citySlug, exp))
    .filter((r): r is SalaryResult => r !== null);
  const representative = allBands.find((r) => r.experience === "3-5") ?? allBands[0]!;

  const title = buildMetaTitle(role.title, city.name);
  const description = buildMetaDescription(representative, allBands);
  const canonical = `/salary/${jobSlug}/${citySlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function SalaryStaticPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { jobSlug, citySlug } = await params;
  const role = ROLES[jobSlug];
  const city = CITY_CONFIGS[citySlug];
  if (!role || !city) notFound();

  const allBands: SalaryResult[] = EXPERIENCE_BANDS
    .map((exp) => computeSalary(jobSlug, citySlug, exp))
    .filter((r): r is SalaryResult => r !== null);
  const representative = allBands.find((r) => r.experience === "3-5") ?? allBands[0]!;

  const SITE = "https://addify.ae";
  const pageUrl = `${SITE}/salary/${jobSlug}/${citySlug}`;

  // Occupation schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: role.title,
    occupationalCategory: role.category,
    occupationLocation: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "Country", name: city.country },
    },
    estimatedSalary: allBands.map((band) => ({
      "@type": "MonetaryAmountDistribution",
      name: EXPERIENCE_LABELS_LONG[band.experience],
      currency: city.currency,
      duration: "P1M",
      percentile25: band.p25,
      median: band.median,
      percentile75: band.p75,
    })),
    description: `Salary benchmarks for ${role.title} roles in ${city.name}, ${city.country}, based on Gulf market salary data aggregated by Addify.`,
    mainEntityOfPage: pageUrl,
  };

  // FAQ schema
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the average ${role.title} salary in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A ${role.title} in ${city.name} earns a median of ${formatCurrency(representative.median, city.currency)} per month for 3–5 years of experience, ranging from ${formatCurrency(representative.p25, city.currency)} to ${formatCurrency(representative.p75, city.currency)}. Based on 2025 GCC market salary data.`,
        },
      },
      {
        "@type": "Question",
        name: `How much does an experienced ${role.title} make in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: allBands.map((b) => `${EXPERIENCE_LABELS_LONG[b.experience]}: ${formatCurrency(b.median, city.currency)}/month (median).`).join(" "),
        },
      },
      {
        "@type": "Question",
        name: `What is the total package for a ${role.title} in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The total monthly package for a ${role.title} in ${city.name} with 3–5 years of experience is approximately ${formatCurrency(representative.totalPackage, city.currency)}, including a housing allowance of ${formatCurrency(representative.housingMonthly, city.currency)}/month (~${representative.housingPct}% of base salary).`,
        },
      },
    ],
  };

  // Breadcrumb schema
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE },
      { "@type": "ListItem", position: 2, name: "Salary Check", item: `${SITE}/salary` },
      { "@type": "ListItem", position: 3, name: `${role.title} in ${city.name}`, item: pageUrl },
    ],
  };

  // Related cities (same role)
  const relatedCities = CITY_SLUGS.filter((s) => s !== citySlug).slice(0, 5);
  // Related roles (same category)
  const relatedRoles = ROLE_SLUGS.filter(
    (s) => s !== jobSlug && ROLES[s].category === role.category
  ).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--foreground)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/salary" className="hover:text-[var(--foreground)]">
            Salary Check
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">
            {role.title} in {city.name}
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            {role.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight">
            {role.title} Salary in {city.name}
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] max-w-2xl">
            Monthly gross salary benchmarks for {role.title}s in {city.name},{" "}
            {city.country} across four experience levels. Based on 2025 GCC
            market data.
          </p>
        </div>

        {/* Featured stat (3–5 years) */}
        <div className="bg-[var(--foreground)] text-white rounded-2xl p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-white/60 text-sm mb-1">
              Median salary, 3 to 5 years experience
            </p>
            <p className="text-4xl md:text-5xl font-bold text-[var(--accent)] tabular-nums">
              {formatCurrency(representative.median, city.currency)}
            </p>
            <p className="text-white/60 text-sm mt-1">per month</p>
          </div>
          <div className="shrink-0 text-sm text-white/70 space-y-1">
            <p>
              Range:{" "}
              <span className="text-white font-medium">
                {formatCurrency(representative.p25, city.currency)} to{" "}
                {formatCurrency(representative.p75, city.currency)}
              </span>
            </p>
            <p>
              Housing:{" "}
              <span className="text-white font-medium">
                {formatCurrency(representative.housingMonthly, city.currency)}
                /mo
              </span>
            </p>
            <p>
              Total package:{" "}
              <span className="text-white font-medium">
                {formatCurrency(representative.totalPackage, city.currency)}
                /mo
              </span>
            </p>
          </div>
        </div>

        {/* All experience bands table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">
              Salary by experience level
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Monthly gross basic salary in {city.currency}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--background)] text-[var(--muted)] text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-semibold">
                    Experience
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    25th %ile
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    Median
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    75th %ile
                  </th>
                  <th className="text-right px-6 py-3 font-semibold hidden sm:table-cell">
                    Total pkg
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {allBands.map((band) => (
                  <tr
                    key={band.experience}
                    className={
                      band.experience === "3-5"
                        ? "bg-[var(--accent-light)]/30"
                        : "hover:bg-[var(--background)]"
                    }
                  >
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      {EXPERIENCE_LABELS_LONG[band.experience]}
                      {band.experience === "3-5" && (
                        <span className="ml-2 text-xs text-[var(--accent)] font-semibold">
                          ★ most searched
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-[var(--muted)]">
                      {formatCurrency(band.p25, city.currency)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-[var(--foreground)]">
                      {formatCurrency(band.median, city.currency)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-[var(--muted)]">
                      {formatCurrency(band.p75, city.currency)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-[var(--muted)] hidden sm:table-cell">
                      {formatCurrency(band.totalPackage, city.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--background)]">
            <p className="text-xs text-[var(--muted)]">
              Sources: Bayt Salary Report 2024 · Robert Half GCC Salary Guide ·
              Cooper Fitch GCC Salary Survey. Estimates only. Actual pay varies
              by employer, skills, and negotiation.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              Check a different role or city
            </p>
            <p className="text-sm text-[var(--muted)]">
              Use our interactive tool to explore all 25 roles across 9 GCC
              cities.
            </p>
          </div>
          <Link
            href="/salary"
            className="shrink-0 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors"
          >
            Open salary tool →
          </Link>
        </div>

        {/* Related: same role, other cities */}
        {relatedCities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">
              {role.title} salary in other cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedCities.map((slug) => (
                <Link
                  key={slug}
                  href={`/salary/${jobSlug}/${slug}`}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors bg-[var(--surface)]"
                >
                  {CITY_CONFIGS[slug].name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related: same category, same city */}
        {relatedRoles.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">
              Other {role.category} salaries in {city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedRoles.map((slug) => (
                <Link
                  key={slug}
                  href={`/salary/${slug}/${citySlug}`}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors bg-[var(--surface)]"
                >
                  {ROLES[slug].title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
