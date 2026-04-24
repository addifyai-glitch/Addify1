import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy | Addify",
  description: "How Addify collects, uses, and protects your personal data. GDPR and UAE PDPL compliant.",
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3 text-base text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Legal</p>
          <h1 className="font-display text-4xl text-foreground mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

          <Section title="1. What we collect">
            <p>When you use Addify, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact form submissions:</strong> name, email address, and message content.</li>
              <li><strong>Job submissions:</strong> job details and submitter email address.</li>
              <li><strong>Usage data:</strong> page views, clicks, and session duration via privacy-respecting analytics (no personal identifiers stored).</li>
              <li><strong>Technical data:</strong> IP address (hashed for rate-limiting only, not stored in identifiable form), browser type, and device type.</li>
            </ul>
            <p>We do <strong>not</strong> collect salary search queries, resume content, or cover letter data.</p>
          </Section>

          <Section title="2. How we use your data">
            <p>We use collected data solely to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Respond to contact form messages</li>
              <li>Review and publish job submissions</li>
              <li>Improve the platform through aggregate analytics</li>
              <li>Prevent spam and abuse (hashed IP rate-limiting)</li>
            </ul>
            <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties, recruiters, or employers.</p>
          </Section>

          <Section title="3. Cookies">
            <p>We use two categories of cookies:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential cookies:</strong> required for the site to function (authentication session for admin users).</li>
              <li><strong>Analytics cookies:</strong> used to understand aggregate traffic patterns. No personal data is tied to these cookies.</li>
            </ul>
            <p>You can disable non-essential cookies in your browser settings at any time.</p>
          </Section>

          <Section title="4. Google AdSense (advertising)">
            <p>
              We may display advertising served by Google AdSense. AdSense uses cookies to personalize ads based on your prior visits to this website and other websites. You can opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" className="text-accent underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
            </p>
            <p>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. For more information, please visit{" "}
              <a href="https://policies.google.com/technologies/ads" className="text-accent underline" target="_blank" rel="noopener noreferrer">Google&apos;s advertising policies</a>.
            </p>
          </Section>

          <Section title="5. Third-party services">
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> database and authentication. Data is stored in EU-West region servers.</li>
              <li><strong>Vercel:</strong> hosting and serverless functions. See Vercel&apos;s <a href="https://vercel.com/legal/privacy-policy" className="text-accent underline">privacy policy</a>.</li>
              <li><strong>Google Analytics:</strong> aggregate traffic analytics (IP anonymization enabled).</li>
              <li><strong>Google AdSense:</strong> advertising (when activated — see Section 4).</li>
            </ul>
          </Section>

          <Section title="6. Your rights (GDPR &amp; UAE PDPL)">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to processing based on legitimate interest</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@addify.ae" className="text-accent underline">privacy@addify.ae</a>.</p>
          </Section>

          <Section title="7. Data retention">
            <p>Contact form messages are retained for 12 months. Job submission data is retained for the duration of the listing plus 90 days. Analytics data is aggregated and anonymized after 26 months.</p>
          </Section>

          <Section title="8. Children&apos;s privacy">
            <p>Addify is not intended for users under the age of 16. We do not knowingly collect data from children. If you believe a child has submitted personal data, contact us immediately.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>We may update this policy periodically. Material changes will be communicated via a notice on the homepage. Continued use of the service after changes constitutes acceptance.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy questions: <a href="mailto:privacy@addify.ae" className="text-accent underline">privacy@addify.ae</a></p>
          </Section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
