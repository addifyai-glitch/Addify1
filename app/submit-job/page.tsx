"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CaptchaNotice } from "@/components/ui/captcha-notice";
import { CITY_GROUPS } from "@/data/cities";
import { JOB_CATEGORIES } from "@/data/jobTitles";

const EXPERIENCE_OPTIONS = [
  { label: "0-2 years",  value: "Entry" },
  { label: "3-5 years",  value: "Mid" },
  { label: "6-10 years", value: "Senior" },
  { label: "10+ years",  value: "Executive" },
];

export default function SubmitJobPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    title: "", company: "", city: "", currency: "AED",
    category: "", salary_min: "", salary_max: "", experience_level: "", apply_url: "",
    description: "", submitter_email: "",
    website: "", // honeypot
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const captchaToken = executeRecaptcha ? await executeRecaptcha("submit_job") : "";
      const country = CITY_GROUPS.find(g => g.cities.some(c => c.name === form.city))?.country ?? form.city;
      const res = await fetch("/api/jobs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, country, captchaToken }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
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
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Post a Job</p>
            <h1 className="font-display text-4xl text-foreground mb-3">Hire Gulf talent. Free.</h1>
            <p className="text-muted-foreground">
              Submit a job listing. We&apos;ll review it within 24 hours and publish it across Addify.
            </p>
          </div>

          {status === "success" ? (
            <div className="p-8 bg-success/10 border border-success/30 rounded-2xl text-center">
              <p className="text-xl font-semibold text-foreground mb-2">
                Submitted. We will review and publish within 24 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll notify you at {form.submitter_email} once it goes live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
              <CaptchaNotice />
              {/* Honeypot */}
              <input name="website" value={form.website} onChange={e => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Job Title *</label>
                  <input className={inputCls} required value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior Software Engineer" />
                </div>
                <div>
                  <label className={labelCls}>Company Name <span className="normal-case font-normal">(optional)</span></label>
                  <input className={inputCls} value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Noon.com" />
                </div>
              </div>

              <div>
                <label className={labelCls}>City *</label>
                <select className={inputCls} required value={form.city} onChange={e => {
                  const city = e.target.value;
                  const currency = CITY_GROUPS.find(g => g.cities.some(c => c.name === city))?.currency ?? "AED";
                  setForm(f => ({ ...f, city, currency }));
                }}>
                  <option value="">Select a city…</option>
                  {CITY_GROUPS.map(g => (
                    <optgroup key={g.country} label={`${g.country} (${g.currency})`}>
                      {g.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Currency</label>
                  <input className={inputCls} value={form.currency} readOnly />
                </div>
                <div>
                  <label className={labelCls}>Salary Min (optional)</label>
                  <input className={inputCls} type="number" min="0" value={form.salary_min} onChange={e => set("salary_min", e.target.value)} placeholder="15000" />
                </div>
                <div>
                  <label className={labelCls}>Salary Max (optional)</label>
                  <input className={inputCls} type="number" min="0" value={form.salary_max} onChange={e => set("salary_max", e.target.value)} placeholder="25000" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select className={inputCls} required value={form.category} onChange={e => set("category", e.target.value)}>
                  <option value="">Select a category…</option>
                  {JOB_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Experience Level</label>
                <select className={inputCls} value={form.experience_level} onChange={e => set("experience_level", e.target.value)}>
                  <option value="">Any / not specified</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Apply URL *</label>
                <input className={inputCls} type="url" required value={form.apply_url} onChange={e => set("apply_url", e.target.value)} placeholder="https://careers.yourcompany.com/apply" />
              </div>

              <div>
                <label className={labelCls}>Job Description * (200 to 2000 characters)</label>
                <textarea
                  className={inputCls}
                  rows={5}
                  required
                  minLength={200}
                  maxLength={2000}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements…"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {form.description.length} / 2000
                </p>
              </div>

              <div>
                <label className={labelCls}>Your Email * (for review notifications)</label>
                <input className={inputCls} type="email" required value={form.submitter_email} onChange={e => set("submitter_email", e.target.value)} placeholder="you@company.com" />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <Button type="submit" size="lg" className="justify-center" disabled={status === "loading"}>
                {status === "loading" ? "Submitting…" : "Submit Job for Review"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Jobs are reviewed manually within 24 hours. Free forever for direct employers.
              </p>
            </form>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
