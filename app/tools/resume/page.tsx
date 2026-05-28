'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { AdSlot } from '@/components/ui/ad-slot';
import { useResumeStorage } from '@/lib/hooks/useResumeStorage';
import { SAMPLE_RESUME, TemplateId } from '@/types/resume';
import { ContactSection } from '@/components/resume/editor/ContactSection';
import { SummarySection } from '@/components/resume/editor/SummarySection';
import { ExperienceSection } from '@/components/resume/editor/ExperienceSection';
import { EducationSection } from '@/components/resume/editor/EducationSection';
import { SkillsSection } from '@/components/resume/editor/SkillsSection';
import { ProjectsSection } from '@/components/resume/editor/ProjectsSection';
import { SimpleListSection } from '@/components/resume/editor/SimpleListSection';
import { RenderTemplate, TEMPLATES } from '@/components/resume/templates';

type Tab = 'edit' | 'preview';
type Section = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'languages', label: 'Languages' },
  { id: 'certifications', label: 'Certifications' },
];

export default function ResumeBuilderPage() {
  const { resume, setResume, template, setTemplate, loaded, reset } = useResumeStorage();
  const [tab, setTab] = useState<Tab>('edit');
  const [openSection, setOpenSection] = useState<Section>('contact');

  // AI summary state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Share state
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = 'https://addify.ae/tools/resume';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleImproveWithAI() {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/tools/resume/improve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: resume.summary,
          jobTitle: resume.contact.jobTitle,
          captchaToken: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'AI request failed');
      } else {
        setAiSuggestion(data.improved);
      }
    } catch {
      setAiError('Network error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const templateBar = (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTemplate(t.id as TemplateId)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            template === t.id
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setResume(SAMPLE_RESUME)}
        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors no-print"
      >
        Load sample
      </button>
      <button
        type="button"
        onClick={() => { if (confirm('Clear all resume data?')) reset(); }}
        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors no-print"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors no-print"
      >
        {copied ? 'Copied!' : 'Share'}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity no-print"
      >
        Download PDF
      </button>
    </div>
  );

  const sectionContent = (
    <div className="space-y-1">
      {SECTIONS.map(({ id, label }) => (
        <div key={id} className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenSection(openSection === id ? ('_none' as Section) : id)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>{label}</span>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === id ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSection === id && (
            <div className="px-4 pb-4 pt-1 border-t border-border">
              {id === 'contact' && (
                <ContactSection contact={resume.contact} onChange={(c) => setResume({ ...resume, contact: c })} />
              )}
              {id === 'summary' && (
                <SummarySection
                  summary={resume.summary}
                  onChange={(s) => setResume({ ...resume, summary: s })}
                  jobTitle={resume.contact.jobTitle}
                  onImproveWithAI={handleImproveWithAI}
                  aiLoading={aiLoading}
                  aiError={aiError}
                  aiSuggestion={aiSuggestion}
                  onAcceptAI={() => { if (aiSuggestion) { setResume({ ...resume, summary: aiSuggestion }); setAiSuggestion(null); } }}
                  onDismissAI={() => setAiSuggestion(null)}
                />
              )}
              {id === 'experience' && (
                <ExperienceSection experience={resume.experience} onChange={(e) => setResume({ ...resume, experience: e })} />
              )}
              {id === 'education' && (
                <EducationSection education={resume.education} onChange={(e) => setResume({ ...resume, education: e })} />
              )}
              {id === 'skills' && (
                <SkillsSection items={resume.skills} onChange={(s) => setResume({ ...resume, skills: s })} />
              )}
              {id === 'projects' && (
                <ProjectsSection projects={resume.projects} onChange={(p) => setResume({ ...resume, projects: p })} />
              )}
              {id === 'languages' && (
                <SimpleListSection items={resume.languages} onChange={(l) => setResume({ ...resume, languages: l })} placeholder="e.g. English (Fluent)" />
              )}
              {id === 'certifications' && (
                <SimpleListSection items={resume.certifications} onChange={(c) => setResume({ ...resume, certifications: c })} placeholder="e.g. Google Ads Certified" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const previewPane = (
    <div className="rounded-2xl border border-border bg-muted/30 overflow-auto shadow-soft">
      <div className="min-w-[600px]">
        <RenderTemplate id={template} data={resume} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <Container className="max-w-7xl">
          {/* Hero */}
          <div className="mb-6 no-print">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Resume Builder</p>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Build your resume</h1>
            <p className="text-sm text-muted-foreground">Free, anonymous, auto-saved. No account needed.</p>
          </div>

          {/* Ad slot */}
          <AdSlot slot="in-content" className="mb-6 no-print" />

          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
            {templateBar}
            {actionButtons}
          </div>
          <p className="text-xs text-muted-foreground mb-6 no-print">
            Click <strong>Download PDF</strong>, then click <strong>Print</strong> in the confirmation — your browser&apos;s print dialog opens next. Choose <strong>Save as PDF</strong> as the destination.
          </p>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden gap-1 p-1 rounded-xl bg-muted border border-border mb-4 no-print">
            {(['edit', 'preview'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  tab === t ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Desktop: two columns. Mobile: tabs */}
          <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-8 xl:grid-cols-[520px_1fr]">
            {/* Editor column */}
            <div className={`${tab === 'preview' ? 'hidden lg:block' : ''} no-print`}>
              {sectionContent}
            </div>

            {/* Preview column */}
            <div className={tab === 'edit' ? 'hidden lg:block' : ''}>
              {previewPane}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
