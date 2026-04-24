import type { Metadata } from "next";
import SalaryForm from "./SalaryForm";

export const metadata: Metadata = {
  title: "GCC Salary Check | Know What You're Worth | GulfFit",
  description:
    "Look up monthly salary ranges for 25 roles across Dubai, Abu Dhabi, Riyadh, Doha, and 5 more GCC cities. Based on 2025 market benchmarks.",
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
        <p className="mt-3 text-base text-[var(--muted)] max-w-xl mx-auto">
          Select your job title, city, and experience level. We&apos;ll show you
          the median salary, percentile range, and a typical total package
          breakdown — all in local currency.
        </p>
      </div>

      <SalaryForm />
    </div>
  );
}
