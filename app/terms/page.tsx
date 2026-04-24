import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms of Service | Addify",
  description: "Addify Terms of Service — your rights and obligations when using the platform.",
  alternates: { canonical: "/terms" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3 text-base text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Legal</p>
          <h1 className="font-display text-4xl text-foreground mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

          <Section title="1. Acceptance">
            <p>By accessing or using Addify (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </Section>

          <Section title="2. Service description">
            <p>Addify provides salary benchmarking, job fit scoring, cover letter generation, and job listing tools for professionals in the Gulf Cooperation Council (GCC) region and Egypt. The Service is provided &quot;as is&quot; and may change without notice.</p>
          </Section>

          <Section title="3. User accounts">
            <p>Some features may require account creation. You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized access.</p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Scrape, crawl, or systematically extract data from the Service</li>
              <li>Submit false, misleading, or fraudulent job listings</li>
              <li>Attempt to bypass rate limits, authentication, or security measures</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Harass, spam, or send unsolicited communications to other users</li>
            </ul>
          </Section>

          <Section title="5. User-submitted content">
            <p>By submitting job listings, testimonials, or salary data, you grant Addify a non-exclusive, royalty-free license to display and distribute that content on the platform. You represent that you have the right to submit such content and that it is accurate.</p>
            <p>Addify reserves the right to remove any content that violates these Terms or is deemed inappropriate.</p>
          </Section>

          <Section title="6. Salary data disclaimer">
            <p>Salary figures on Addify are estimates based on publicly available market data and user submissions. They are provided for <strong>general guidance only and do not constitute financial, legal, or employment advice</strong>. Actual compensation varies significantly by employer, skills, experience, and negotiation. Do not make financial decisions based solely on Addify data.</p>
          </Section>

          <Section title="7. Intellectual property">
            <p>All content, design, and software on Addify is owned by or licensed to Addify. You may not reproduce, distribute, or create derivative works without express written permission.</p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>To the fullest extent permitted by applicable law, Addify shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed AED 100.</p>
          </Section>

          <Section title="9. Governing law">
            <p>These Terms are governed by the laws of the United Arab Emirates and the Emirate of Dubai. Any disputes shall be subject to the exclusive jurisdiction of the Dubai courts.</p>
          </Section>

          <Section title="10. Changes to terms">
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="11. Contact">
            <p>For questions about these Terms: <a href="mailto:legal@addify.ae" className="text-accent underline">legal@addify.ae</a></p>
          </Section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
