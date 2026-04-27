"use client";

import { useState, useRef } from "react";
import { Copy, CheckCheck, RefreshCw, Download, Edit3 } from "lucide-react";
import type { CoverLetterOutput } from "@/lib/cover-letter/mock-generate";

export type CoverLetterContext = {
  resumeLabel: string;
  jdLabel: string;
  language: "english" | "arabic";
  tone: string;
  length: string;
  hiringManager: string;
};

type Props = {
  output: CoverLetterOutput;
  context: CoverLetterContext;
  onRegenerate: () => void;
  regenerating: boolean;
};

export function CoverLetterResult({ output, context, onRegenerate, regenerating }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  function handleCopy() {
    const text = bodyRef.current?.innerText ?? output.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    window.print();
  }

  const isArabic = context.language === "arabic";

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Resume:</span>
            <span className="truncate max-w-[220px]">{context.resumeLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Job:</span>
            <span className="truncate max-w-[220px]">{context.jdLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{context.tone}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{context.length}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{context.language === "arabic" ? "Arabic" : "English"}</span>
            {context.hiringManager && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">To: {context.hiringManager}</span>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold bg-accent/15 text-accent px-3 py-1 rounded-full">
          Demo result. Live AI generation coming soon.
        </span>
      </div>

      {/* Letter body */}
      <div className="p-6 md:p-10 print-letter">
        <div
          ref={bodyRef}
          contentEditable={editing}
          suppressContentEditableWarning
          dir={isArabic ? "rtl" : "ltr"}
          className={`prose prose-sm md:prose-base max-w-none focus:outline-none ${
            editing
              ? "border border-accent/40 rounded-xl p-4 bg-background focus:ring-2 focus:ring-accent/20"
              : ""
          }`}
          style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
        >
          {output.body}
        </div>
        <p className="mt-8 text-xs text-muted-foreground border-t border-border pt-4">
          Generated with Addify · addify.ae
        </p>
      </div>

      {/* Action row */}
      <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors duration-200"
        >
          {copied ? (
            <><CheckCheck size={14} className="text-success" /><span className="text-success">Copied!</span></>
          ) : (
            <><Copy size={14} />Copy</>
          )}
        </button>

        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
          Regenerate
        </button>

        <button
          onClick={handleDownload}
          title="Opens print dialog. Choose 'Save as PDF' as destination."
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors duration-200 no-print"
        >
          <Download size={14} />
          Download as PDF
        </button>

        <button
          onClick={() => setEditing((e) => !e)}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors duration-200 ${
            editing
              ? "border-accent bg-accent/10 text-accent"
              : "border-border hover:border-accent hover:text-accent"
          }`}
        >
          <Edit3 size={14} />
          {editing ? "Done editing" : "Edit in place"}
        </button>
      </div>
    </div>
  );
}
