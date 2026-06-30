"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { AdSlot } from "@/components/ui/ad-slot";
import { FitResult, type FitInputContext } from "@/components/fit/fit-result";
import { Sparkles, Upload, FileText, X, Link as LinkIcon } from "lucide-react";

type ResumeTab = "upload" | "paste";
type JDTab = "paste" | "url" | "upload";

export default function FitPage() {
  // Resume state
  const [resumeTab, setResumeTab] = useState<ResumeTab>("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  // Job description state
  const [jdTab, setJdTab] = useState<JDTab>("paste");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdFetching, setJdFetching] = useState(false);
  const [jdFetchError, setJdFetchError] = useState("");
  const [jdFetchedDomain, setJdFetchedDomain] = useState("");
  const jdFileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [context, setContext] = useState<FitInputContext | null>(null);

  function getResumeLabel(): string {
    if (resumeTab === "upload" && resumeFile) return resumeFile.name;
    if (resumeTab === "paste" && resumeText.trim()) {
      return `"${resumeText.trim().slice(0, 80)}${resumeText.length > 80 ? "..." : ""}"`;
    }
    return "No resume provided";
  }

  function getJDLabel(): string {
    if (jdTab === "url" && jdFetchedDomain) return `${jdFetchedDomain} (fetched)`;
    if (jdTab === "url" && jdUrl) return jdUrl;
    if (jdTab === "upload" && jdFile) return jdFile.name;
    if (jdTab === "paste" && jdText.trim()) {
      return `"${jdText.trim().slice(0, 80)}${jdText.length > 80 ? "..." : ""}"`;
    }
    return "No job description provided";
  }

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
        setJdTab("paste");
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

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setContext(null);
    await new Promise((r) => setTimeout(r, 1500));
    setContext({ resumeLabel: getResumeLabel(), jdLabel: getJDLabel() });
    setStatus("done");
  }

  const tabBtn = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Fit Score</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Does this job actually fit you?
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl mx-auto">
              Upload your resume and paste any Gulf job description. We score your fit from 0 to 100 with specific reasons.
            </p>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume column */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/75 mb-2">Your Resume</p>
                <div className="flex gap-2 mb-3">
                  <button type="button" className={tabBtn(resumeTab === "upload")} onClick={() => setResumeTab("upload")}>
                    <span className="flex items-center gap-1.5"><Upload size={12} /> Upload File</span>
                  </button>
                  <button type="button" className={tabBtn(resumeTab === "paste")} onClick={() => setResumeTab("paste")}>
                    <span className="flex items-center gap-1.5"><FileText size={12} /> Paste Text</span>
                  </button>
                </div>

                {resumeTab === "upload" ? (
                  resumeFile ? (
                    <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-background">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText size={15} className="text-accent shrink-0" />
                        <span className="truncate max-w-[200px]">{resumeFile.name}</span>
                      </div>
                      <button type="button" onClick={() => { setResumeFile(null); if (resumeFileRef.current) resumeFileRef.current.value = ""; }} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setResumeFile(f); }}
                      onClick={() => resumeFileRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                    >
                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Drop your resume here</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF or DOCX accepted</p>
                      <input ref={resumeFileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
                    </div>
                  )
                ) : (
                  <textarea className={inputCls} rows={10} placeholder="Paste your resume text here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
                )}
              </div>

              {/* Job description column */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/75 mb-2">Job Description</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <button type="button" className={tabBtn(jdTab === "paste")} onClick={() => setJdTab("paste")}>
                    <span className="flex items-center gap-1.5"><FileText size={12} /> Paste Text</span>
                  </button>
                  <button type="button" className={tabBtn(jdTab === "url")} onClick={() => { setJdTab("url"); setJdFetchError(""); }}>
                    <span className="flex items-center gap-1.5"><LinkIcon size={12} /> Paste URL</span>
                  </button>
                  <button type="button" className={tabBtn(jdTab === "upload")} onClick={() => setJdTab("upload")}>
                    <span className="flex items-center gap-1.5"><Upload size={12} /> Upload File</span>
                  </button>
                </div>

                {jdTab === "paste" && (
                  <textarea className={inputCls} rows={14} placeholder="Paste the job description here..." value={jdText} onChange={(e) => setJdText(e.target.value)} />
                )}

                {jdTab === "url" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        className={`${inputCls} flex-1`}
                        placeholder="https://www.linkedin.com/jobs/view/... or any Gulf job URL"
                        value={jdUrl}
                        onChange={(e) => { setJdUrl(e.target.value); setJdFetchError(""); setJdFetchedDomain(""); }}
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
                    <p className="text-xs text-muted-foreground">We fetch the page and extract the job description automatically.</p>
                    {jdFetchError && <p className="text-xs text-destructive">{jdFetchError}</p>}
                    {jdFetchedDomain && (
                      <div className="flex items-center gap-2 text-xs text-success">
                        <span>Fetched from {jdFetchedDomain}</span>
                        <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setJdFetchedDomain(""); setJdText(""); setJdUrl(""); }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {jdFetchedDomain && jdText && (
                      <div className="border border-border rounded-xl p-3 bg-muted/30 text-xs text-muted-foreground max-h-32 overflow-auto">
                        {jdText.slice(0, 300)}...
                      </div>
                    )}
                  </div>
                )}

                {jdTab === "upload" && (
                  jdFile ? (
                    <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-background">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText size={15} className="text-accent shrink-0" />
                        <span className="truncate max-w-[200px]">{jdFile.name}</span>
                      </div>
                      <button type="button" onClick={() => { setJdFile(null); if (jdFileRef.current) jdFileRef.current.value = ""; }} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setJdFile(f); }}
                      onClick={() => jdFileRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                    >
                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Drop the job description file here</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF or DOCX accepted</p>
                      <input ref={jdFileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setJdFile(e.target.files?.[0] ?? null)} />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground text-base font-semibold shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none transition-all duration-200"
              >
                {status === "loading" ? (
                  <span className="animate-pulse">Analyzing...</span>
                ) : (
                  <><Sparkles size={18} /> Analyze Fit</>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Free. No signup required. Your data is not stored.
              </p>
            </div>
          </form>

          {status === "done" && context && (
            <>
              <AdSlot format="in-article" className="mt-10" />
              <FitResult context={context} />
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
