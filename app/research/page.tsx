import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "@/components/layout/trust-page";
import { Schema, articleSchema } from "@/lib/trust-content";

const PAGE_URL = "https://addify.ae/research";
const LAST_REVIEWED = "2026-06-22";

export const metadata: Metadata = {
  title: "Research | Addify",
  description:
    "Salary reports, hiring trend analyses, and Gulf labour market research published by Addify.",
  alternates: { canonical: PAGE_URL },
};

type ReportStatus = "published" | "coming-soon";

const REPORTS: Array<{
  title: string;
  description: string;
  status: ReportStatus;
  date: string | null;
  href?: string;
}> = [
  {
    title: "UAE Salary Report 2026",
    description:
      "What professionals earn across the UAE in 2026 – monthly salary ranges by role and seniority, benchmarked across three published GCC market reports.",
    status: "published",
    date: "2026-06-01",
    href: "/research/uae-salary-report-2026",
  },
  {
    title: "Saudi Arabia Salary Report 2026",
    description:
      "Salary benchmarks and hiring trends across Saudi Arabia in 2026 – monthly SAR ranges for key roles in Riyadh and Jeddah from three published GCC market reports.",
    status: "published",
    date: "2026-06-01",
    href: "/research/saudi-arabia-salary-report-2026",
  },
  {
    title: "Dubai Tech Salary Report 2026",
    description:
      "What software engineers, data analysts, and tech leaders earn in Dubai in 2026 – monthly AED ranges benchmarked across three published GCC market reports.",
    status: "published",
    date: "2026-06-01",
    href: "/research/dubai-tech-salary-report-2026",
  },
  {
    title: "GCC Salary Trends 2025",
    description:
      "Median salary movements across 25 roles in 9 Gulf cities, benchmarked against 2024 figures from three published market reports.",
    status: "coming-soon",
    date: null,
  },
  {
    title: "UAE Job Market: Q1 2025",
    description:
      "Hiring velocity, role demand, and compensation shifts across UAE's five major sectors based on live job listing data.",
    status: "coming-soon",
    date: null,
  },
  {
    title: "GCC Women in Tech: Salary & Representation",
    description:
      "Gender pay gap analysis and representation data for technology roles across UAE, Saudi Arabia, and Qatar.",
    status: "coming-soon",
    date: null,
  },
];

export default function ResearchPage() {
  const publishedReports = REPORTS.filter((r) => r.status === "published");

  const schema = articleSchema({
    headline: "Addify Research Hub",
    description:
      "Salary reports and Gulf labour market research published by Addify.",
    url: PAGE_URL,
    lastReviewed: LAST_REVIEWED,
  });

  return (
    <>
      <Schema data={schema} />
      <TrustPage
        eyebrow="Research"
        title="Gulf market research, published honestly"
        intro="Original analysis of salary trends, hiring patterns, and labour market shifts across the GCC. Reports are gated until published — we do not link to pages that don't exist."
        lastReviewed={LAST_REVIEWED}
      >
        {publishedReports.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Published reports
            </h2>
            <div className="space-y-4">
              {publishedReports.map((r) => (
                <div key={r.title} className="rounded-xl border border-border p-6 hover:border-accent/50 transition-colors">
                  <h3 className="font-semibold text-foreground mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
                  <div className="flex items-center justify-between gap-4">
                    {r.date && (
                      <p className="text-xs text-muted-foreground">Published {r.date}</p>
                    )}
                    {r.href && (
                      <Link href={r.href} className="text-sm font-medium text-accent hover:underline underline-offset-2">
                        Read report →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Coming soon
          </h2>
          <p className="mb-4">
            These reports are in progress. Links will appear when they are published.
          </p>
          <div className="space-y-4">
            {REPORTS.filter((r) => r.status === "coming-soon").map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-border border-dashed p-6 opacity-75"
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                    In progress
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Suggest a research question
          </h2>
          <p>
            If there is a Gulf salary or hiring trend you would like to see us cover,
            write to us at{" "}
            <a
              href="mailto:hello@addify.ae"
              className="text-accent underline underline-offset-2"
            >
              hello@addify.ae
            </a>
            . We prioritise topics that serve job seekers making real career decisions.
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
              <Link href="/methodology" className="text-accent hover:underline underline-offset-2">
                How we calculate salary estimates →
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-accent hover:underline underline-offset-2">
                Blog: career advice and market insights →
              </Link>
            </li>
          </ul>
        </nav>
      </TrustPage>
    </>
  );
}
