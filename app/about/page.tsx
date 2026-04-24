import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Addify | Gulf Careers, Clarified.",
  description: "We built Addify to give Gulf job seekers the salary intelligence and career clarity they deserve. Learn our story and principles.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Addify", description: "Built in the Gulf, for the Gulf.", url: "/about", type: "website" },
};

const principles = [
  { title: "Privacy-first", desc: "We never sell your data or share it with employers. Your searches and inputs stay private." },
  { title: "Transparent data", desc: "Every salary figure shows its source. We tell you when data is limited or estimated." },
  { title: "Built locally", desc: "We understand the nuances of Gulf hiring — visa categories, housing allowances, nationality factors." },
  { title: "Always free core tools", desc: "Salary Check, Fit Score basics, and Cover Letter previews are free, forever." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">About Us</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground max-w-2xl mx-auto leading-tight mb-6">
              Built in the Gulf, for the Gulf.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Addify gives professionals across the UAE, Saudi Arabia, Qatar, and beyond the salary intelligence and career clarity they deserve.
            </p>
          </Container>
        </section>

        {/* Why we built it */}
        <section className="py-16 md:py-20">
          <Container className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">Why we built Addify</h2>
            {/* TODO: Replace these two paragraphs with your personal founder story */}
            <div className="space-y-5 text-base text-muted-foreground leading-relaxed">
              <p>
                [TODO — Personalize this paragraph with your founder story. Why did you build Addify? What problem did you personally face when job hunting in the Gulf? What was missing from existing tools like Bayt, Glassdoor, or LinkedIn?]
              </p>
              <p>
                [TODO — Continue your story. Who is Addify for? What makes it different? What's your vision for how it helps Gulf professionals? Keep it honest and specific — users connect with real stories, not generic mission statements.]
              </p>
            </div>
          </Container>
        </section>

        {/* Principles */}
        <section className="py-16 bg-muted/30">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-10 text-center">Our principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {principles.map((p) => (
                <div key={p.title} className="bg-card border border-border rounded-xl p-6 shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-success/15 flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-success" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Team */}
        <section className="py-16 md:py-20">
          <Container className="max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">The team</h2>
            <p className="text-muted-foreground mb-8">
              {/* TODO: Replace with your name and background */}
              Led by <strong>[Your Name]</strong> — [TODO: one sentence about your background and why you&apos;re the right person to build this].
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              Get in touch →
            </Link>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
