// Schema for comparison pages.
// No schema.org "Comparison" type exists — the correct non-penalised approach:
//   - FAQPage   (the comparison Q&As — strong AI-citation surface)
//   - BreadcrumbList (hierarchy)
//   - Dataset   (marks up the structured comparative salary data honestly)
// Never fabricate a fake @type — misrepresenting schema earns penalties.

import { ParsedComparison, SideFigure, SalaryDelta } from "./comparison";

const SITE = "https://addify.ae";

export function comparisonUrl(slug: string): string {
  return `${SITE}/salary/compare/${slug}`;
}

export function breadcrumbSchema(p: ParsedComparison, slug: string) {
  const item = (name: string, url: string, pos: number) => ({
    "@type": "ListItem", position: pos, name, item: url,
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      item("Salary", `${SITE}/salary`, 1),
      item("Compare", `${SITE}/salary/compare`, 2),
      item(`${p.role.name}: ${p.leftLabel} vs ${p.rightLabel}`, comparisonUrl(slug), 3),
    ],
  };
}

export function faqSchema(
  p: ParsedComparison,
  left: SideFigure,
  right: SideFigure,
  delta: SalaryDelta
) {
  const q = (name: string, text: string) => ({
    "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text },
  });
  const higherLabel = delta.higher === "left" ? left.label : delta.higher === "right" ? right.label : null;

  const faqs = [
    q(
      `Is a ${p.role.name} paid more in ${left.label} or ${right.label}?`,
      delta.sameCurrency && higherLabel
        ? `A ${p.role.name} earns more in ${higherLabel}: a median of ${fmt(left)} versus ${fmt(right)} – about ${delta.percentDiff}% higher. Figures are from Addify GCC salary data.`
        : `A ${p.role.name} earns a median of ${fmt(left)} in ${left.label} and ${fmt(right)} in ${right.label}. These figures are in different currencies; see the real-terms discussion on the page rather than comparing the numbers directly.`
    ),
    q(
      `What is the median ${p.role.name} salary in ${left.label}?`,
      `The median ${p.role.name} salary in ${left.label} is ${fmt(left)} per month, from Addify GCC salary data.`
    ),
    q(
      `What is the median ${p.role.name} salary in ${right.label}?`,
      `The median ${p.role.name} salary in ${right.label} is ${fmt(right)} per month, from Addify GCC salary data.`
    ),
  ];
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs };
}

export function datasetSchema(
  p: ParsedComparison,
  left: SideFigure,
  right: SideFigure,
  slug: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${p.role.name} salary: ${left.label} vs ${right.label}`,
    description:
      `Median monthly ${p.role.name} salary compared between ${left.label} (${fmt(left)}) ` +
      `and ${right.label} (${fmt(right)}), from Addify GCC salary data.`,
    creator: { "@type": "Organization", name: "Addify", url: SITE },
    isAccessibleForFree: true,
    url: comparisonUrl(slug),
    variableMeasured: "Monthly salary (median)",
  };
}

function fmt(s: SideFigure): string {
  return `${s.currency} ${s.median.toLocaleString()}`;
}
