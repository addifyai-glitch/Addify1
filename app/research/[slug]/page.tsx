import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Schema, articleSchema } from "@/lib/trust-content";
import { getPostBySlug } from "@/lib/blog";
import { getSalaryFigure } from "@/lib/salary-source-of-truth";
import { buildBlogMetadata, cleanTitle } from "@/lib/blog-meta";
import { ButtonLink } from "@/components/blog/button-link";

// ─── Report registry ──────────────────────────────────────────────────────────
// Prose is fetched from Supabase via dbSlug (the original blog slug).
// Salary tables render from source of truth — no hardcoded figures here.
// Sources point to /methodology and /data-sources, never forums.

interface ReportDef {
  title: string;
  dbSlug: string;
  seoDescription: string;
  published: string;
  tables: Array<{
    heading: string;
    rows: Array<{ citySlug: string; roleSlug: string; label: string }>;
  }>;
}

const REPORTS: Record<string, ReportDef> = {
  "uae-salary-report-2026": {
    title: "UAE Salary Report 2026",
    dbSlug:
      "uae-salary-report-2026-salaries-hiring-trends-and-what-professionals-need-to-know",
    seoDescription:
      "What professionals earn across the UAE in 2026 – monthly salary ranges by role and seniority, benchmarked across three published GCC market reports.",
    published: "2026-06-01",
    tables: [
      {
        heading: "UAE salaries by role (monthly, mid-seniority)",
        rows: [
          { citySlug: "dubai", roleSlug: "software-engineer", label: "Software Engineer" },
          { citySlug: "dubai", roleSlug: "product-manager", label: "Product Manager" },
          { citySlug: "dubai", roleSlug: "marketing-manager", label: "Marketing Manager" },
          { citySlug: "dubai", roleSlug: "finance-manager", label: "Finance Manager" },
          { citySlug: "dubai", roleSlug: "hr-manager", label: "HR Manager" },
        ],
      },
    ],
  },
  "saudi-arabia-salary-report-2026": {
    title: "Saudi Arabia Salary Report 2026",
    dbSlug: "saudi-arabia-salary-report-2026-and-gcc-hiring-trends",
    seoDescription:
      "Salary benchmarks and hiring trends across Saudi Arabia in 2026 – monthly SAR ranges for key roles in Riyadh and Jeddah, from three published GCC market reports.",
    published: "2026-06-01",
    tables: [
      {
        heading: "Saudi Arabia salaries by role (monthly, mid-seniority)",
        rows: [
          { citySlug: "riyadh", roleSlug: "software-engineer", label: "Software Engineer" },
          { citySlug: "riyadh", roleSlug: "product-manager", label: "Product Manager" },
          { citySlug: "riyadh", roleSlug: "marketing-manager", label: "Marketing Manager" },
          { citySlug: "riyadh", roleSlug: "finance-manager", label: "Finance Manager" },
          { citySlug: "riyadh", roleSlug: "operations-manager", label: "Operations Manager" },
        ],
      },
    ],
  },
  "dubai-tech-salary-report-2026": {
    title: "Dubai Tech Salary Report 2026",
    dbSlug:
      "dubai-tech-salary-report-2026-what-software-engineers-ai-experts-and-tech-leaders-are-really-earning",
    seoDescription:
      "What software engineers, data analysts, designers, and tech leaders earn in Dubai in 2026 – monthly AED ranges benchmarked across three published GCC market reports.",
    published: "2026-06-01",
    tables: [
      {
        heading: "Dubai tech salaries by role (monthly, mid-seniority)",
        rows: [
          { citySlug: "dubai", roleSlug: "software-engineer", label: "Software Engineer" },
          { citySlug: "dubai", roleSlug: "senior-software-engineer", label: "Senior Software Engineer" },
          { citySlug: "dubai", roleSlug: "product-manager", label: "Product Manager" },
          { citySlug: "dubai", roleSlug: "data-analyst", label: "Data Analyst" },
          { citySlug: "dubai", roleSlug: "ui-ux-designer", label: "UI/UX Designer" },
        ],
      },
    ],
  },
};

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(REPORTS).map((slug) => ({ slug }));
}

export const dynamicParams = false;

// ─── Metadata ────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = REPORTS[slug];
  if (!r) return {};
  return buildBlogMetadata({
    slug: `research/${slug}`,
    title: r.title,
    body: "",
    seoDescription: r.seoDescription,
  });
}

// ─── Salary table (async Server Component) ────────────────────────────────────

async function SalaryTable({
  heading,
  rows,
}: ReportDef["tables"][number]) {
  const figures = await Promise.all(
    rows.map(async (row) => ({
      row,
      fig: await getSalaryFigure(row.citySlug, row.roleSlug),
    }))
  );
  const live = figures.filter((f) => f.fig !== null);

  if (live.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Salary figures for this section are being verified. See{" "}
        <Link href="/methodology" className="text-accent underline underline-offset-2">
          our methodology
        </Link>{" "}
        for details.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <caption className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">
          {heading}
        </caption>
        <thead>
          <tr className="bg-muted/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <th className="px-4 py-2.5">Role</th>
            <th className="px-4 py-2.5">Median / month</th>
            <th className="px-4 py-2.5">Range</th>
            <th className="px-4 py-2.5 hidden sm:table-cell">Based on</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {live.map(({ row, fig }) => (
            <tr key={`${row.citySlug}-${row.roleSlug}`} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
              <td className="px-4 py-3 text-foreground">
                {fig!.currency} {fig!.monthlyMedian.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {fig!.currency} {fig!.monthlyMin.toLocaleString()}–{fig!.monthlyMax.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                {fig!.sampleSize} source reports
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const r = REPORTS[slug];
  if (!r) notFound();

  const post = await getPostBySlug(r.dbSlug);
  const url = `https://addify.ae/research/${slug}`;

  const schema = articleSchema({
    headline: cleanTitle(r.title),
    description: r.seoDescription,
    url,
    lastReviewed: r.published,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Schema data={schema} />
      <main className="flex-1 py-12 md:py-16">
        <Container className="max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/research" className="hover:text-foreground transition-colors">
                  Research
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground">{cleanTitle(r.title)}</li>
            </ol>
          </nav>

          {/* Header */}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Research
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
            {cleanTitle(r.title)}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Addify · Published {r.published} ·{" "}
            <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
              How we calculate these figures
            </Link>
          </p>

          <hr className="border-border mb-10" />

          {/* Report prose (from Supabase) */}
          {post && (
            <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline mb-12">
              <MDXRemote source={post.content} components={{ ButtonLink }} />
            </article>
          )}

          {/* Authoritative salary tables — always from source of truth */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Salary figures
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ranges below are drawn from{" "}
              <Link href="/data-sources" className="text-accent hover:underline underline-offset-2">
                three published GCC market reports
              </Link>{" "}
              and benchmarked at mid-seniority (3–5 years experience). These are the same figures
              used in the{" "}
              <Link href="/salary" className="text-accent hover:underline underline-offset-2">
                Addify Salary Check tool
              </Link>
              .
            </p>
            {r.tables.map((t) => (
              <SalaryTable key={t.heading} {...t} />
            ))}
          </section>

          {/* Sources */}
          <section className="mb-12 p-5 rounded-xl border border-border bg-muted/20">
            <h2 className="text-base font-semibold text-foreground mb-2">Sources & methodology</h2>
            <p className="text-sm text-muted-foreground">
              Salary figures are derived from three independently published GCC salary reports.
              See{" "}
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                how we calculate estimates
              </Link>{" "}
              and{" "}
              <Link href="/data-sources" className="text-accent hover:underline underline-offset-2">
                which reports we use
              </Link>
              .
            </p>
          </section>

          {/* Funnel */}
          <section className="p-6 rounded-xl border border-accent/30 bg-accent/5">
            <h2 className="text-base font-semibold text-foreground mb-1">
              Check your specific role and city
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              The Salary Check tool lets you select your exact role, city, and experience level.
            </p>
            <Link
              href="/salary"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-2"
            >
              Run the Salary Check →
            </Link>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
