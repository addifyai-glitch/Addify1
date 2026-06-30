import type { Metadata } from "next";
import Link from "next/link";
import { getComparisonPaths } from "@/lib/comparison";
import { parseComparisonSlug } from "@/lib/comparison";

export const metadata: Metadata = {
  title: "Salary Comparisons: Gulf Cities & Countries | Addify",
  description:
    "Compare salaries for the same role across Gulf cities and countries. Side-by-side median figures from Addify GCC salary data.",
  alternates: { canonical: "https://addify.ae/salary/compare" },
};

function formatSlug(slug: string): string {
  const p = parseComparisonSlug(slug);
  if (!p) return slug;
  return `${p.role.name}: ${p.leftLabel} vs ${p.rightLabel}`;
}

export default async function CompareIndexPage() {
  const paths = await getComparisonPaths();

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/salary" className="hover:text-foreground transition-colors">Salary</Link>
        <span>/</span>
        <span className="text-foreground">Compare</span>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Compare</p>
      <h1 className="font-display text-4xl text-foreground leading-tight mb-4">
        Gulf salary comparisons
      </h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Side-by-side median salary figures for the same role across Gulf cities and countries.
        Every number reads from the same data source as the Salary Check tool — comparisons
        can&rsquo;t contradict salary pages.
      </p>

      {paths.length > 0 ? (
        <ul className="space-y-3">
          {paths.map(({ comparison }) => (
            <li key={comparison}>
              <Link
                href={`/salary/compare/${comparison}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 hover:border-accent/50 transition-colors group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  {formatSlug(comparison)}
                </span>
                <span className="text-muted-foreground text-sm shrink-0">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Comparison pages are being prepared. Check back soon.
        </p>
      )}

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Looking for a specific comparison?{" "}
          <Link href="/salary" className="text-accent hover:underline underline-offset-2">
            Use the Salary Check tool →
          </Link>
        </p>
      </div>
    </div>
  );
}
