import type { Metadata } from "next";
import CoverLetterClient from "./cover-letter-client";
import { buildBreadcrumbLd } from "@/lib/breadcrumb-schema";
import { JsonLd } from "@/components/JsonLd";

// Noindex and out of the sitemap while this is a waitlist page. The generator
// isn't live, and a thin non-functional tool page is a quality signal problem.
// At launch: remove `robots` here and re-add /cover-letter to app/sitemap.ts.
export const metadata: Metadata = {
  title: "Cover Letter Writer (Coming Soon)",
  description:
    "We're building a cover letter writer for Gulf job applications, in English and Arabic. It isn't live yet. Join the waitlist to hear when it launches.",
  alternates: { canonical: "/cover-letter" },
  robots: { index: false, follow: true },
};

// No SoftwareApplication schema while this page is noindex: it would claim a
// working generator ("free AI tool that generates... in under 60 seconds")
// on a page that openly says it isn't live yet. Re-add it alongside removing
// `robots` above, at launch.
const breadcrumbLd = buildBreadcrumbLd([
  { name: "Home", url: "/" },
  { name: "Cover Letter", url: "/cover-letter" },
]);

// Optional 40-60 word self-contained direct answer, same pattern as blog
// frontmatter's answerCapsule field. Left unset here — writing the actual
// copy is owned by the content prompts, not this branch.
const ANSWER_CAPSULE: string | undefined = undefined;

export default function CoverLetterPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd]} />
      <CoverLetterClient answerCapsule={ANSWER_CAPSULE} />
    </>
  );
}
