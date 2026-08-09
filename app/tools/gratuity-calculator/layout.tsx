import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UAE End-of-Service Gratuity Calculator 2026",
  description:
    "Calculate your UAE end-of-service gratuity for 2026. Covers limited and unlimited contracts, resignation and termination rules, and the 2 year salary cap. Free and instant.",
  alternates: { canonical: "/tools/gratuity-calculator" },
  openGraph: {
    type: "website",
    title: "UAE End-of-Service Gratuity Calculator 2026 | Addify.ae",
    description:
      "Work out your UAE gratuity in seconds. Enter your salary, contract type, and years of service to see a full breakdown based on UAE labor law.",
    url: "https://addify.ae/tools/gratuity-calculator",
    siteName: "Addify.ae",
    locale: "en_AE",
  },
  twitter: {
    card: "summary",
    title: "UAE End-of-Service Gratuity Calculator 2026 | Addify.ae",
    description: "Calculate your UAE end-of-service gratuity for 2026 in seconds, free on Addify.ae.",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "UAE End-of-Service Gratuity Calculator",
  url: "https://addify.ae/tools/gratuity-calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description:
    "A free calculator that estimates UAE end-of-service gratuity for limited and unlimited contracts, based on basic salary, years of service, and reason for leaving.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@type": "Organization", name: "Addify.ae", url: "https://addify.ae" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who is entitled to end-of-service gratuity in the UAE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any private sector employee who completes at least one year of continuous service is entitled to gratuity under UAE labor law, regardless of nationality. Free zone employees are usually covered too, though some free zones such as DIFC and ADGM apply their own pension or gratuity rules.",
      },
    },
    {
      "@type": "Question",
      name: "How is UAE gratuity calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gratuity is based on your last basic salary, not your total salary. You earn 21 days of basic pay for each of your first 5 years of service, and 30 days of basic pay for each year after that. The total is capped at 2 years of basic salary.",
      },
    },
    {
      "@type": "Question",
      name: "Does resigning reduce my gratuity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On an unlimited contract, resigning before 1 year pays no gratuity, 1 to 3 years pays one third, 3 to 5 years pays two thirds, and 5 years or more pays the full amount. On a limited contract, resigning before the contract ends can reduce your gratuity to zero unless your employer agrees otherwise.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a cap on gratuity in the UAE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Total gratuity cannot exceed 2 years of your basic salary, no matter how many years you have worked.",
      },
    },
    {
      "@type": "Question",
      name: "Do part-time or freelance workers get gratuity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Part-time employees on a registered UAE work permit are entitled to gratuity calculated on a pro-rata basis tied to their actual working hours. Freelancers and independent contractors without an employment contract are not entitled to gratuity.",
      },
    },
  ],
};

export default function GratuityCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
