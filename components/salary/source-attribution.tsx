import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";

type Source = {
  authority: string;
  authorityUrl: string;
  lawReference: string;
  notes: string;
};

const COUNTRY_SOURCES: Record<string, Source[]> = {
  UAE: [
    {
      authority: "Ministry of Human Resources and Emiratisation (MOHRE)",
      authorityUrl: "https://www.mohre.gov.ae",
      lawReference: "Federal Decree Law No. 33 of 2021 on Regulation of Labour Relations",
      notes: "Reference for working hours, end of service gratuity, and contract types.",
    },
    {
      authority: "Wage Protection System (WPS)",
      authorityUrl: "https://www.mohre.gov.ae",
      lawReference: "WPS regulations",
      notes: "Reference for salary payment standards.",
    },
  ],
  "Saudi Arabia": [
    {
      authority: "Ministry of Human Resources and Social Development",
      authorityUrl: "https://www.hrsd.gov.sa",
      lawReference: "Saudi Labor Law (Royal Decree No. M/51)",
      notes: "Reference for working hours, leave, and end of service awards.",
    },
    {
      authority: "General Organization for Social Insurance (GOSI)",
      authorityUrl: "https://www.gosi.gov.sa",
      lawReference: "Social insurance contribution rules",
      notes: "Reference for salary structure and contributions.",
    },
  ],
  Qatar: [
    {
      authority: "Ministry of Labour",
      authorityUrl: "https://www.adlsa.gov.qa",
      lawReference: "Qatar Labour Law No. 14 of 2004 (as amended)",
      notes: "Reference for minimum wage, end of service, and contract standards.",
    },
  ],
  Kuwait: [
    {
      authority: "Public Authority for Manpower",
      authorityUrl: "https://www.pam.gov.kw",
      lawReference: "Kuwait Labour Law No. 6 of 2010",
      notes: "Reference for working conditions and end of service indemnity.",
    },
  ],
  Bahrain: [
    {
      authority: "Ministry of Labour",
      authorityUrl: "https://www.mol.gov.bh",
      lawReference: "Labour Law for the Private Sector (Law No. 36 of 2012)",
      notes: "Reference for wages, leave, and termination.",
    },
  ],
  Oman: [
    {
      authority: "Ministry of Labour",
      authorityUrl: "https://www.mol.gov.om",
      lawReference: "Oman Labour Law (Royal Decree 53/2023)",
      notes: "Reference for wages, working hours, and end of service.",
    },
  ],
  Egypt: [
    {
      authority: "Ministry of Manpower",
      authorityUrl: "https://www.manpower.gov.eg",
      lawReference: "Egyptian Labour Law No. 12 of 2003",
      notes: "Reference for wages, contracts, and labor standards.",
    },
  ],
};

const MOCK_SUBMISSION_COUNT = 12;
const MOCK_LAST_UPDATED = "April 2026";

function ConfidenceLine() {
  const count = MOCK_SUBMISSION_COUNT;
  if (count >= 10) {
    return (
      <span>
        Based on {count} anonymous submissions plus public benchmarks. Last updated {MOCK_LAST_UPDATED}.
      </span>
    );
  }
  if (count >= 1) {
    return (
      <span>
        Based on {count} anonymous submission{count > 1 ? "s" : ""} and public benchmarks.{" "}
        Help improve accuracy by{" "}
        <Link href="/contribute" className="underline underline-offset-2 hover:no-underline">
          adding yours
        </Link>
        .
      </span>
    );
  }
  return (
    <span>
      Based on public salary guides only.{" "}
      <Link href="/contribute" className="underline underline-offset-2 hover:no-underline">
        Be the first to contribute data
      </Link>{" "}
      for this role and city.
    </span>
  );
}

export function SourceAttribution({ country }: { country: string }) {
  const sources = COUNTRY_SOURCES[country] ?? COUNTRY_SOURCES["UAE"];

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
        <ShieldCheck className="h-5 w-5 text-success shrink-0" />
        How we calculated this
      </h3>

      <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
        Ranges are built from anonymous user submissions on Addify, public job postings, and salary
        guides from Robert Half, Cooper Fitch, and Hays. Allowance norms and labor standards
        reference each country&apos;s official labor framework.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
        {sources.map((src) => (
          <div key={src.authority} className="rounded-lg border border-border bg-background p-4">
            <p className="font-semibold text-foreground mb-1">{src.authority}</p>
            <a
              href={src.authorityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent text-xs hover:underline mb-2"
            >
              Visit official site
              <ExternalLink size={11} />
            </a>
            <p className="text-xs text-foreground/70 mb-1 font-medium">{src.lawReference}</p>
            <p className="text-xs text-muted-foreground">{src.notes}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-foreground/60">
        <ConfidenceLine />
      </p>

      <p className="mt-3 text-xs text-foreground/75">
        Salary ranges are indicative, not guaranteed. Actual compensation depends on company size,
        candidate experience, and negotiation. This is not financial or legal advice.
      </p>
    </section>
  );
}
