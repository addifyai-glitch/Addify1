import type { Metadata } from "next";
import SalaryForm from "./SalaryForm";

export const metadata: Metadata = {
  title: "GCC Salary Check | Know What You're Worth | Addify",
  description:
    "Free salary benchmarks for 120+ roles across 34 cities in the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and Egypt. Know what your role pays.",
  alternates: { canonical: "/salary" },
};

export default function SalaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
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
