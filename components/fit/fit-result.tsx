"use client";

import { useEffect, useRef } from "react";
import { Check, AlertTriangle } from "lucide-react";

const MOCK_RESULT = {
  score: 78,
  summary: "Strong match — worth applying with targeted tweaks.",
  categories: [
    { label: "Skill Match", score: 85 },
    { label: "Experience Fit", score: 72 },
    { label: "Salary Alignment", score: 80 },
    { label: "Location / Visa Fit", score: 90 },
    { label: "Career Trajectory", score: 65 },
  ],
  strengths: [
    "5+ years experience in the required domain",
    "Matches 8 of 10 required skills",
    "Your salary expectation aligns with market",
  ],
  gaps: [
    "Missing AWS certification mentioned in job description",
    "2 years less than preferred tenure",
  ],
  nextSteps: [
    "Highlight your domain experience more prominently on your resume",
    "Add quantified results (revenue, users, time saved) to your most recent role",
    "Consider mentioning relevant certifications you're currently pursuing",
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

export function FitResult() {
  const r = MOCK_RESULT;

  return (
    <div className="mt-10 space-y-6">
      {/* Demo badge */}
      <div className="flex justify-center">
        <span className="inline-block text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
          Demo result — live AI analysis coming soon
        </span>
      </div>

      {/* Score card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <ScoreRing score={r.score} />
          <div className="flex-1">
            <p className="text-xl font-semibold text-foreground mb-1">{r.summary}</p>
            <p className="text-sm text-muted-foreground mb-6">Based on your resume and the job description provided.</p>
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

      {/* CTA */}
      <div id="cover-letter" className="text-center py-8 border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">
          Cover letter generator — coming in the next update.
        </p>
      </div>
    </div>
  );
}
