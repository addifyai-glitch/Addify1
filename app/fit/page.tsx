"use client";

import { useState, useRef } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { AdSlot } from "@/components/ui/ad-slot";
import { FitResult } from "@/components/fit/fit-result";
import { Sparkles, Upload, FileText, X } from "lucide-react";

type Tab = "upload" | "paste";

export default function FitPage() {
  const [resumeTab, setResumeTab] = useState<Tab>("upload");
  const [resumeText, setResumeText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setUploadedFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadedFile(file);
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("done");
  }

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      resumeTab === t
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <Container className="max-w-4xl">
          {/* Hero text */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Fit Score</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Does this job actually fit you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload your resume and paste any Gulf job description. We&apos;ll score your fit from 0–100 with specific reasons.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume column */}
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Your Resume</p>
                  <div className="flex gap-2 mb-3">
                    <button type="button" className={tabCls("upload")} onClick={() => setResumeTab("upload")}>
                      <span className="flex items-center gap-1.5"><Upload size={13} /> Upload File</span>
                    </button>
                    <button type="button" className={tabCls("paste")} onClick={() => setResumeTab("paste")}>
                      <span className="flex items-center gap-1.5"><FileText size={13} /> Paste Text</span>
                    </button>
                  </div>

                  {resumeTab === "upload" ? (
                    uploadedFile ? (
                      <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3 bg-background">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <FileText size={15} className="text-accent" />
                          <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                      >
                        <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-foreground font-medium">Drop your resume here</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX accepted</p>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFile}
                        />
                      </div>
                    )
                  ) : (
                    <textarea
                      className={inputCls}
                      rows={10}
                      placeholder="Paste your resume text here…"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Job description column */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Job Description</p>
                <textarea
                  className={inputCls}
                  rows={15}
                  placeholder="Paste the job description here, or paste a Dubai / Riyadh / Doha job URL…"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>
            </div>

            {/* Analyze button */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground text-base font-semibold shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none transition-all duration-200"
              >
                {status === "loading" ? (
                  <>
                    <span className="animate-pulse">Analyzing…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Fit
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Free — no signup required. Your data is not stored unless you sign up.
              </p>
            </div>
          </form>

          {/* Ad between form and result */}
          {status === "done" && (
            <>
              <AdSlot slot="in-content" className="mt-10" />
              <FitResult />
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
