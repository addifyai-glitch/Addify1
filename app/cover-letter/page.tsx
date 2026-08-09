import type { Metadata } from "next";
import CoverLetterClient from "./cover-letter-client";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator",
  description:
    "Paste your resume and a job description to get a tailored cover letter in Arabic or English in under 60 seconds. Free, no signup required.",
  alternates: { canonical: "/cover-letter" },
};

export default function CoverLetterPage() {
  return <CoverLetterClient />;
}
