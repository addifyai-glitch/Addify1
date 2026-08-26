import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { TEMPLATES } from '@/components/resume/templates';
import { ResumeBuilderClient } from './resume-builder-client';

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  Modern: 'A clean, sans-serif layout with a bold name header and an optional profile photo. Works well for most Gulf and international roles.',
  Classic: 'A traditional serif layout with a centered header, suited to finance, legal, and other more conservative industries.',
  Minimal: 'A single-column, photo-free layout built for ATS (applicant tracking system) parsing — the safest choice for strict automated screening, especially outside the Gulf.',
};

const FAQS = [
  {
    q: 'Is the resume builder really free?',
    a: 'Yes. All three templates, the AI summary helper, and PDF export are free, with no signup or account required.',
  },
  {
    q: "Is my resume data stored on Addify's servers?",
    a: "No. Your resume is saved only in your own browser's local storage. It's sent to our server briefly only when you export a PDF or request an AI-written summary, and isn't stored afterward.",
  },
  {
    q: 'Will I lose my information if I switch templates?',
    a: 'No. Your content and your template choice are stored separately, so you can switch between Modern, Classic, and Minimal at any time without re-entering anything.',
  },
  {
    q: 'Which template should I use for ATS (applicant tracking system) screening?',
    a: "Minimal is the safest choice — it's a single-column, photo-free layout built for automated parsing. Modern and Classic include an optional photo, which is common in Gulf hiring but can be less compatible with strict ATS systems used more often outside the region.",
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Just start typing — your draft saves automatically in your browser as you go.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ResumeBuilderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main className="flex-1">
        <Container className="max-w-4xl pt-8 md:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Resume Builder</p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">Build your resume</h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Free, anonymous, auto-saved. Pick a template, fill in your experience, and export
            a polished, Gulf-ready resume as a PDF. No account needed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-1">{t.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {TEMPLATE_DESCRIPTIONS[t.name]}
                </p>
              </div>
            ))}
          </div>
        </Container>

        <ResumeBuilderClient />

        <Container className="max-w-3xl py-12 md:py-16">
          <h2 className="font-display text-xl text-foreground mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-xl border border-border bg-card p-4 group">
                <summary className="text-sm font-semibold text-foreground cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-accent group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
