import type { Metadata } from "next";
import CoverLetterClient from "./cover-letter-client";
import { buildBreadcrumbLd } from "@/lib/breadcrumb-schema";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator",
  description:
    "Paste your resume and a job description to get a tailored cover letter in Arabic or English in under 60 seconds. Free, no signup required.",
  alternates: { canonical: "/cover-letter" },
};

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Addify AI Cover Letter Generator",
  url: "https://addify.ae/cover-letter",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  description:
    "A free AI tool that generates a tailored cover letter in Arabic or English from a resume and job description in under 60 seconds.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@type": "Organization", name: "Addify", url: "https://addify.ae" },
};

const breadcrumbLd = buildBreadcrumbLd([
  { name: "Home", url: "/" },
  { name: "Cover Letter", url: "/cover-letter" },
]);

export default function CoverLetterPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationLd, breadcrumbLd]} />
      <CoverLetterClient />
    </>
  );
}
