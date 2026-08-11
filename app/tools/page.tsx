import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, LayoutTemplate, FileText, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

const PAGE_URL = "https://addify.ae/tools";

export const metadata: Metadata = {
  title: "Free Career Tools",
  description:
    "Free tools for anyone working or job-hunting in the UAE: calculate your end-of-service gratuity, build an ATS-ready resume, and generate a cover letter in minutes. No signup required.",
  alternates: { canonical: "/tools" },
  openGraph: {
    type: "website",
    title: "Free Career Tools | Addify",
    description:
      "Free tools for anyone working or job-hunting in the UAE: calculate your end-of-service gratuity, build an ATS-ready resume, and generate a cover letter.",
    url: PAGE_URL,
    siteName: "Addify.ae",
    locale: "en_AE",
  },
};

const tools = [
  {
    Icon: Calculator,
    name: "Gratuity Calculator",
    href: "/tools/gratuity-calculator",
    description:
      "Estimate your UAE end-of-service gratuity in seconds, based on your salary, contract type, and years of service.",
  },
  {
    Icon: LayoutTemplate,
    name: "Resume Builder",
    href: "/tools/resume-builder",
    description:
      "Build a polished, ATS-ready resume with live preview and instant PDF export. No account needed.",
  },
  {
    Icon: FileText,
    name: "Cover Letter",
    href: "/cover-letter",
    description:
      "Generate a tailored cover letter for any Gulf role in Arabic or English, ready in under 60 seconds.",
  },
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Container className="py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Tools
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Free career tools for the Gulf
            </h1>
            <p className="mt-3 text-base md:text-lg text-foreground/80">
              Practical, free tools for anyone working or job-hunting in the UAE and the wider
              Gulf. No signup required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative bg-card border border-border rounded-xl shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col p-8"
              >
                <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <tool.Icon size={20} className="text-accent-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{tool.name}</h2>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                  {tool.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all duration-200">
                  Try it free
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
