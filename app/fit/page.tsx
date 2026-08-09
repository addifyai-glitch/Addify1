import type { Metadata } from "next";
import FitClient from "./fit-client";

export const metadata: Metadata = {
  title: "AI Job Fit Score Checker",
  description:
    "Paste your resume and any Gulf job description to get an instant AI-powered fit score from 0 to 100, with specific reasons why you match or don't. Free, no signup required.",
  alternates: { canonical: "/fit" },
};

export default function FitPage() {
  return <FitClient />;
}
