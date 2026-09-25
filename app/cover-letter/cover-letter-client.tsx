"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Upload, FileText, X, Link as LinkIcon } from "lucide-react";
import { ExampleLetter } from "@/components/cover-letter/example-letter";
import { WaitlistForm } from "@/components/cover-letter/waitlist-form";
import { JobAdPreview } from "@/components/cover-letter/job-ad-preview";
import { AnswerCapsule } from "@/components/AnswerCapsule";

type ResumeTab = "upload" | "paste";
type JDTab = "paste" | "url" | "upload";
type Language = "english" | "arabic";
type Tone = "professional" | "friendly" | "confident" | "concise";
type Length = "short" | "medium" | "long";

export default function CoverLetterClient({
  answerCapsule,
}: {
  // Optional 40-60 word self-contained direct answer, same pattern as blog
  // frontmatter's answerCapsule field. Writing the actual copy is owned by
  // the content prompts, not this branch.
  answerCapsule?: string;
} = {}) {
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
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 mb-3">
              Cover Letter · Coming soon
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              A cover letter that sounds like you.
            </h1>
            {answerCapsule && <AnswerCapsule>{answerCapsule}</AnswerCapsule>}
            <p className="text-lg text-foreground/80 max-w-xl mx-auto">
              We&apos;re building a cover letter writer for Gulf job applications, in English and
              Arabic. It isn&apos;t live yet. Join the waitlist and we&apos;ll email you when it is.
            </p>
          </div>

          <div
            role="note"
            className="mb-8 rounded-xl border border-accent/40 bg-accent/10 px-5 py-4 text-sm text-foreground"
          >
            <strong className="font-semibold">The writer isn&apos;t live yet.</strong> The three steps
            below show how it will work, but nothing you enter here produces a letter today. Your
            resume text and files stay in your browser.
          </div>

          <div className="space-y-8">
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

              {jdTab === "paste" && jdText.trim() && <JobAdPreview text={jdText} />}

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
                  {jdFetchedDomain && jdText && <JobAdPreview text={jdText} />}
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
                      Arabic and English are both planned for launch.
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

            {/* Waitlist replaces the generate button until real generation ships */}
            <WaitlistForm tool="cover-letter" />
          </div>

          <ExampleLetter />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
