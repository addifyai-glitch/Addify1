"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, AlertTriangle, ArrowRight, MapPin, Briefcase } from "lucide-react";
import { MOCK_JOBS } from "@/data/mockJobs";
import type { Job } from "@/types/job";

export type FitInputContext = {
  resumeLabel: string;
  jdLabel: string;
};

const MOCK_RESULT = {
  score: 78,
  summary: "Strong match. Worth applying with a few targeted tweaks.",
  categories: [
    { label: "Skill Match", score: 85 },
    { label: "Experience Fit", score: 72 },
    { label: "Salary Alignment", score: 80 },
    { label: "Location and Visa Fit", score: 90 },
    { label: "Career Trajectory", score: 65 },
  ],
  strengths: [
    "5 or more years of experience in the required domain",
    "Matches 8 of 10 required skills",
    "Salary expectation aligns with the posted range",
  ],
  gaps: [
    "AWS certification mentioned in the job description is not on your resume",
    "2 years below the preferred tenure",
  ],
  nextSteps: [
    "Highlight your domain experience more prominently in your CV summary",
    "Add quantified results to your most recent role (revenue, users, time saved)",
    "Mention any certifications you are currently pursuing",
  ],
};

function ScoreRing({ score }: { score: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = 52;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDasharray = String(circumference);
    el.style.strokeDashoffset = String(circumference);
    const timeout = setTimeout(() => {
      el.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)";
      el.style.strokeDashoffset = String(circumference * (1 - score / 100));
    }, 80);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" className="text-muted/40" strokeWidth="10" />
          <circle
            ref={circleRef}
            cx="60" cy="60" r={r}
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl text-foreground leading-none">{score}</span>
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function FitResult({ context }: { context: FitInputContext }) {
  const r = MOCK_RESULT;

  return (
    <div className="mt-10 space-y-6">
      {/* Demo badge */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-1">Demo result. Live AI analysis is coming soon.</p>
        <p className="text-xs text-muted-foreground">This score is illustrative. Connect your resume and the job description above to see a real analysis when the feature launches.</p>
      </div>

      {/* What was matched */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-1">
        <p><span className="font-medium text-foreground">Resume:</span> {context.resumeLabel}</p>
        <p><span className="font-medium text-foreground">Job description:</span> {context.jdLabel}</p>
      </div>

      {/* Score card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <ScoreRing score={r.score} />
          <div className="flex-1">
            <p className="text-xl font-semibold text-foreground mb-1">{r.summary}</p>
            <p className="text-sm text-muted-foreground mb-6">Based on what you provided above.</p>
            <div className="space-y-3">
              {r.categories.map((c) => (
                <CategoryBar key={c.label} label={c.label} score={c.score} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-success/5 border border-success/20 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Check size={16} className="text-success" />
            Strengths
          </h3>
          <ul className="space-y-2.5">
            {r.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check size={13} className="text-success shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent" />
            Gaps to address
          </h3>
          <ul className="space-y-2.5">
            {r.gaps.map((g) => (
              <li key={g} className="flex items-start gap-2.5 text-sm text-foreground">
                <AlertTriangle size={13} className="text-accent shrink-0 mt-0.5" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Recommended next steps</h3>
        <ol className="space-y-2.5">
          {r.nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Job recommendations */}
      <section className="mt-2">
        <h3 className="text-xl font-display text-foreground mb-1">Jobs that might match your profile</h3>
        <p className="text-sm text-foreground/70 mb-5">Based on your resume and the role you analyzed.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_JOBS.slice(0, 6).map((job: Job) => (
            <JobCardMini key={job.id} job={job} />
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/jobs" className="text-sm font-semibold text-accent hover:underline">
            See all open roles →
          </Link>
        </div>
      </section>

      {/* Cover letter CTA */}
      <div id="cover-letter" className="rounded-xl border border-border bg-card p-6 md:p-8 text-center shadow-soft">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-accent" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Want a cover letter for this role?</h3>
        <p className="text-sm text-foreground/70 mb-4">
          Generate a tailored cover letter using the same resume and job description in under 60 seconds.
        </p>
        <Link
          href="/cover-letter"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-accent-foreground font-semibold text-sm shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
        >
          Generate Cover Letter
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function JobCardMini({ job }: { job: Job }) {
  const cur = job.currency ?? "";
  const fmt = (n: number) => n.toLocaleString("en-US");
  const salary =
    job.salary_min && job.salary_max
      ? `${cur} ${fmt(job.salary_min)} to ${fmt(job.salary_max)}`
      : null;

  return (
    <div className="group bg-card border border-border rounded-xl p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-hover transition-all duration-200 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Briefcase size={13} className="text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground truncate">{job.company}</p>
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{job.title}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin size={10} /> {job.city}, {job.country}
      </p>
      {salary && <p className="text-xs font-semibold text-accent tabular-nums">{salary}/mo</p>}
      <a
        href={job.apply_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-xs font-semibold text-muted-foreground group-hover:text-accent transition-colors"
      >
        Apply →
      </a>
    </div>
  );
}
