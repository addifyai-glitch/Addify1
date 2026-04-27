"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Sparkles, Upload, FileText, X, Link as LinkIcon } from "lucide-react";
import { generateCoverLetter } from "@/lib/cover-letter/mock-generate";
import {
  CoverLetterResult,
  type CoverLetterContext,
} from "@/components/cover-letter/cover-letter-result";
import type { CoverLetterOutput } from "@/lib/cover-letter/mock-generate";

type ResumeTab = "upload" | "paste";
type JDTab = "paste" | "url" | "upload";
type Language = "english" | "arabic";
type Tone = "professional" | "friendly" | "confident" | "concise";
type Length = "short" | "medium" | "long";

const LOADING_PHRASES = [
  "Reading your resume...",
  "Analyzing the job...",
  "Writing your letter...",
  "Polishing tone...",
];

export default function CoverLetterPage() {
  // Resume state
  const [resumeTab, setResumeTab] = useState<ResumeTab>("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  // JD state
  const [jdTab, setJdTab] = useState<JDTab>("paste");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdFetching, setJdFetching] = useState(false);
  const [jdFetchError, setJdFetchError] = useState("");
  const [jdFetchedDomain, setJdFetchedDomain] = useState("");
  const jdFileRef = useRef<HTMLInputElement>(null);

  // Preferences
  const [language, setLanguage] = useState<Language>("english");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [hiringManager, setHiringManager] = useState("");

  // Generation state
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [regenerating, setRegenerating] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [output, setOutput] = useState<CoverLetterOutput | null>(null);
  const [context, setContext] = useState<CoverLetterContext | null>(null);
  const [variant, setVariant] = useState(0);

  function getResumeLabel(): string {
    if (resumeTab === "upload" && resumeFile) return resumeFile.name;
    if (resumeTab === "paste" && resumeText.trim())
      return `"${resumeText.trim().slice(0, 60)}${resumeText.length > 60 ? "..." : ""}"`;
    return "No resume provided";
  }

  function getJDLabel(): string {
    if (jdTab === "url" && jdFetchedDomain) return `${jdFetchedDomain} (fetched)`;
    if (jdTab === "url" && jdUrl) return jdUrl;
    if (jdTab === "upload" && jdFile) return jdFile.name;
    if (jdTab === "paste" && jdText.trim())
      return `"${jdText.trim().slice(0, 60)}${jdText.length > 60 ? "..." : ""}"`;
    return "No job description provided";
  }

  const hasResume = !!(resumeFile || resumeText.trim());
  const hasJD = !!(jdText.trim() || jdFetchedDomain || jdFile);
  const canGenerate = hasResume && hasJD;

  async function fetchJD() {
    if (!jdUrl.trim()) return;
    setJdFetching(true);
    setJdFetchError("");
    setJdFetchedDomain("");
    try {
      const res = await fetch("/api/fit/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJdFetchError(data.error ?? "Failed to fetch. Try pasting instead.");
      } else {
        setJdText(data.text ?? "");
        setJdFetchedDomain(data.domain ?? "");
      }
    } catch {
      setJdFetchError("Something went wrong. Try pasting the job description instead.");
    } finally {
      setJdFetching(false);
    }
  }

  async function runGeneration(variantNum: number) {
    setStatus("loading");
    setOutput(null);

    let phraseIdx = 0;
    setLoadingPhrase(0);
    const phraseTimer = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % LOADING_PHRASES.length;
      setLoadingPhrase(phraseIdx);
    }, 450);

    await new Promise((r) => setTimeout(r, 1800));
    clearInterval(phraseTimer);

    const resumeContent =
      resumeTab === "paste" ? resumeText : resumeFile ? `[File: ${resumeFile.name}]` : "";
    const jdContent =
      jdTab === "paste"
        ? jdText
        : jdFetchedDomain
        ? jdText
        : jdFile
        ? `[File: ${jdFile.name}]`
        : "";

    const result = generateCoverLetter({
      resumeText: resumeContent,
      jdText: jdContent,
      language,
      tone,
      length,
      hiringManager,
      variant: variantNum,
    });

    setOutput(result);
    setContext({
      resumeLabel: getResumeLabel(),
      jdLabel: getJDLabel(),
      language,
      tone,
      length,
      hiringManager,
    });
    setStatus("done");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    await runGeneration(variant);
  }

  async function handleRegenerate() {
    const next = (variant + 1) % 3;
    setVariant(next);
    setRegenerating(true);
    await runGeneration(next);
    setRegenerating(false);
  }

  const tabBtn = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none";

  const toggleBtn = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
      active
        ? "bg-accent text-accent-foreground border-accent"
        : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <Container className="max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Cover Letter
              </p>
              <span className="text-accent/40">·</span>
              <div className="flex items-center gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage("english")}
                  className={`px-2 py-0.5 rounded transition-colors ${language === "english" ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  EN
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => setLanguage("arabic")}
                  className={`px-2 py-0.5 rounded transition-colors ${language === "arabic" ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  عربي
                </button>
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              A cover letter that sounds like you.
            </h1>
            <p className="text-lg text-foreground/75 max-w-xl mx-auto">
              Paste your resume and the job description. Get a tailored cover letter in Arabic
              or English in under 60 seconds. Free, no signup.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Step 1: Resume */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/75 mb-4">
                Step 1 — Your resume
              </p>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  className={tabBtn(resumeTab === "upload")}
                  onClick={() => setResumeTab("upload")}
                >
                  <span className="flex items-center gap-1.5">
                    <Upload size={12} /> Upload File
                  </span>
                </button>
                <button
                  type="button"
                  className={tabBtn(resumeTab === "paste")}
                  onClick={() => setResumeTab("paste")}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} /> Paste Text
                  </span>
                </button>
              </div>

              {resumeTab === "upload" ? (
                resumeFile ? (
                  <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-background">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <FileText size={15} className="text-accent shrink-0" />
                      <span className="truncate max-w-[240px]">{resumeFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeFile(null);
                        if (resumeFileRef.current) resumeFileRef.current.value = "";
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) setResumeFile(f);
                    }}
                    onClick={() => resumeFileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">Drop your resume here</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or DOCX accepted</p>
                    <input
                      ref={resumeFileRef}
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                )
              ) : (
                <textarea
                  className={inputCls}
                  rows={10}
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              )}
            </div>

            {/* Step 2: Job */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/75 mb-4">
                Step 2 — The job
              </p>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  type="button"
                  className={tabBtn(jdTab === "paste")}
                  onClick={() => setJdTab("paste")}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} /> Paste Text
                  </span>
                </button>
                <button
                  type="button"
                  className={tabBtn(jdTab === "url")}
                  onClick={() => {
                    setJdTab("url");
                    setJdFetchError("");
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <LinkIcon size={12} /> Paste URL
                  </span>
                </button>
                <button
                  type="button"
                  className={tabBtn(jdTab === "upload")}
                  onClick={() => setJdTab("upload")}
                >
                  <span className="flex items-center gap-1.5">
                    <Upload size={12} /> Upload File
                  </span>
                </button>
              </div>

              {jdTab === "paste" && (
                <textarea
                  className={inputCls}
                  rows={12}
                  placeholder="Paste the job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              )}

              {jdTab === "url" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className={`${inputCls} flex-1`}
                      placeholder="https://www.linkedin.com/jobs/view/... or any Gulf job URL"
                      value={jdUrl}
                      onChange={(e) => {
                        setJdUrl(e.target.value);
                        setJdFetchError("");
                        setJdFetchedDomain("");
                      }}
                    />
                    <button
                      type="button"
                      onClick={fetchJD}
                      disabled={jdFetching || !jdUrl.trim()}
                      className="shrink-0 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                    >
                      {jdFetching ? "Loading..." : "Fetch"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We fetch the page and extract the job description automatically.
                  </p>
                  {jdFetchError && (
                    <p className="text-xs text-destructive">{jdFetchError}</p>
                  )}
                  {jdFetchedDomain && (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <span>Fetched from {jdFetchedDomain}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setJdFetchedDomain("");
                          setJdText("");
                          setJdUrl("");
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {jdFetchedDomain && jdText && (
                    <div className="border border-border rounded-xl p-3 bg-muted/30 text-xs text-muted-foreground max-h-28 overflow-auto">
                      {jdText.slice(0, 300)}...
                    </div>
                  )}
                </div>
              )}

              {jdTab === "upload" &&
                (jdFile ? (
                  <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-background">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <FileText size={15} className="text-accent shrink-0" />
                      <span className="truncate max-w-[240px]">{jdFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setJdFile(null);
                        if (jdFileRef.current) jdFileRef.current.value = "";
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) setJdFile(f);
                    }}
                    onClick={() => jdFileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      Drop the job description file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or DOCX accepted</p>
                    <input
                      ref={jdFileRef}
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                ))}
            </div>

            {/* Step 3: Preferences */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/75 mb-5">
                Step 3 — Preferences
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Language */}
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Language</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={toggleBtn(language === "english")}
                      onClick={() => setLanguage("english")}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      className={toggleBtn(language === "arabic")}
                      onClick={() => setLanguage("arabic")}
                    >
                      العربية / Arabic
                    </button>
                  </div>
                  {language === "arabic" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Arabic letter generated as a structured demo. Live AI integration coming soon.
                    </p>
                  )}
                </div>

                {/* Tone */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="confident">Confident</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>

                {/* Length */}
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Length</p>
                  <div className="flex gap-2">
                    {(["short", "medium", "long"] as Length[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        className={toggleBtn(length === l)}
                        onClick={() => setLength(l)}
                      >
                        <span className="capitalize">{l}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {length === "short" && "~150 words, one paragraph plus closing"}
                    {length === "medium" && "~250 words, three paragraphs"}
                    {length === "long" && "~400 words, four paragraphs"}
                  </p>
                </div>

                {/* Hiring manager */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">
                    Hiring manager name{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={hiringManager}
                    onChange={(e) => setHiringManager(e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If empty, the letter opens with Dear Hiring Manager.
                  </p>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={!canGenerate || status === "loading"}
                className={`inline-flex items-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold shadow-soft transition-all duration-200 ${
                  canGenerate && status !== "loading"
                    ? "bg-accent text-accent-foreground hover:shadow-glow-accent hover:-translate-y-0.5"
                    : "bg-accent/50 text-accent-foreground/60 cursor-not-allowed"
                }`}
              >
                {status === "loading" ? (
                  <span className="animate-pulse">{LOADING_PHRASES[loadingPhrase]}</span>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Cover Letter
                  </>
                )}
              </button>
              {!canGenerate && status === "idle" && (
                <p className="text-xs text-muted-foreground">
                  Add your resume and a job description to continue.
                </p>
              )}
              {canGenerate && status === "idle" && (
                <p className="text-xs text-muted-foreground">
                  Free. No signup. Your data is not stored.
                </p>
              )}
            </div>
          </form>

          {status === "done" && output && context && (
            <CoverLetterResult
              output={output}
              context={context}
              onRegenerate={handleRegenerate}
              regenerating={regenerating}
            />
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
