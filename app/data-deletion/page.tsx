"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { CaptchaNotice } from "@/components/ui/captcha-notice";

const REQUEST_TYPES = ["Account data", "Contact form data", "All data"] as const;
type RequestType = (typeof REQUEST_TYPES)[number];

export default function DataDeletionPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form, setForm] = useState({ name: "", email: "", requestType: "" as RequestType | "", description: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const canSubmit = !!(form.name && form.email && form.requestType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const captchaToken = executeRecaptcha ? await executeRecaptcha("data_deletion") : "";
      const res = await fetch("/api/data-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <Container className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Legal</p>
          <h1 className="font-display text-4xl text-foreground mb-3">Request data deletion</h1>
          <p className="text-muted-foreground mb-10">
            Use this form to request deletion of any personal data we hold on you. We respond within 30 days.
            For anonymous salary submissions, deletion is not possible because we do not store identifiers
            linking submissions to you.
          </p>

          {status === "success" ? (
            <div className="p-8 bg-success/10 border border-success/30 rounded-2xl text-center">
              <p className="text-lg font-semibold text-foreground mb-2">Request received.</p>
              <p className="text-sm text-muted-foreground">
                We will respond to {form.email} within 30 days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
              <CaptchaNotice />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input
                    className={inputCls}
                    required
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email address *</label>
                  <input
                    className={inputCls}
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Request type *</label>
                <select
                  className={inputCls}
                  required
                  value={form.requestType}
                  onChange={e => set("requestType", e.target.value)}
                >
                  <option value="">Select what to delete...</option>
                  {REQUEST_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Additional details (optional)</label>
                <textarea
                  className={inputCls}
                  rows={4}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Any additional context that helps us identify and process your request."
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || status === "loading"}
                className={`rounded-full px-8 py-3 font-semibold shadow-soft transition-all duration-200 ${
                  canSubmit && status !== "loading"
                    ? "bg-accent text-accent-foreground hover:shadow-glow-accent hover:-translate-y-0.5"
                    : "bg-accent/50 text-accent-foreground/60 cursor-not-allowed"
                }`}
              >
                {status === "loading" ? "Submitting..." : "Submit deletion request"}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Requests are processed within 30 days per GDPR and UAE PDPL requirements.
              </p>
            </form>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
