import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "Submit a job listing for free. Addify reviews it within 24 hours and publishes it across the site to Gulf job seekers.",
  alternates: { canonical: "/submit-job" },
};

export default function SubmitJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
