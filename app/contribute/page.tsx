"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { JOB_CATEGORIES } from "@/data/jobTitles";
import { CITY_GROUPS } from "@/data/cities";
import { CheckCheck, Link2, MessageCircle, Share2 } from "lucide-react";

const EXPERIENCE_LEVELS = ["0 to 2 years", "3 to 5 years", "6 to 10 years", "11 to 15 years", "16 to 20 years", "20 plus years"];
const COMPANY_SIZES = ["1 to 10", "11 to 50", "51 to 200", "201 to 1000", "1000 plus"];

const SHARE_URL = "https://addify.ae/contribute";
const SHARE_TEXT = "I just contributed my salary to Addify. Help make Gulf salaries more transparent for everyone.";

export default function ContributePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [form, setForm] = useState({
    title: "",
    country: "",
    city: "",
    experience: "",
    base_salary: "",
    housing_allowance: "",
    annual_bonus: "",
    nationality: "",
    company_size: "",
    website: "", // honeypot
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const cityGroup = CITY_GROUPS.find(g => g.country === selectedCountry);
  const currency = cityGroup?.currency ?? "AED";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.website) { setStatus("success"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/salaries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok && data.error) throw new Error(data.error);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5";

  const shareLinks = [
    { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}` },
    { label: "LinkedIn", Icon: Share2, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}` },
    { label: "X", Icon: Link2, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-14 md:py-20">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Contribute</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Help the next person know what they are worth.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Your submission is anonymous. We never share individual salaries or your identity. We combine them into the benchmarks everyone sees.
            </p>
          </Container>
        </section>

        <Container className="py-8 max-w-2xl">
          {status === "success" ? (
            <div className="text-center py-12 px-8 bg-success/10 border border-success/30 rounded-2xl">
              <p className="text-xl font-semibold text-foreground mb-2">Thank you.</p>
              <p className="text-base text-muted-foreground mb-8">
                Submissions like yours make Addify accurate. Share it with someone who would find it useful.
              </p>
              <p className="text-sm font-semibold text-foreground mb-4">Share with someone who needs this</p>
              <div className="flex flex-wrap justify-center gap-3">
                {shareLinks.map(({ label, Icon, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                    <Icon size={14} />{label}
                  </a>
                ))}
                <button onClick={handleCopy}
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                  {copied ? <><CheckCheck size={14} className="text-success" /><span className="text-success">Copied</span></> : <><Link2 size={14} />Copy Link</>}
                </button>
              </div>
              <div className="mt-8">
                <Link href="/salary" className="text-sm text-accent hover:underline">Check your salary benchmark</Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
                {/* Honeypot */}
                <input name="website" value={form.website} onChange={e => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

                <div>
                  <label className={labelCls}>Job Title *</label>
                  <select className={inputCls} required value={form.title} onChange={e => set("title", e.target.value)}>
                    <option value="">Select your role...</option>
                    {JOB_CATEGORIES.map(cat => (
                      <optgroup key={cat.name} label={cat.name}>
                        {cat.titles.map(t => <option key={t.slug} value={t.title}>{t.title}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Country *</label>
                    <select className={inputCls} required value={form.country} onChange={e => {
                      const c = e.target.value;
                      setSelectedCountry(c);
                      setForm(f => ({ ...f, country: c, city: "" }));
                    }}>
                      <option value="">Select country...</option>
                      {CITY_GROUPS.map(g => <option key={g.country} value={g.country}>{g.country}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>City *</label>
                    <select className={inputCls} required value={form.city} onChange={e => set("city", e.target.value)} disabled={!selectedCountry}>
                      <option value="">Select city...</option>
                      {(cityGroup?.cities ?? []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Years of Experience *</label>
                  <select className={inputCls} required value={form.experience} onChange={e => set("experience", e.target.value)}>
                    <option value="">Select...</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Monthly Base Salary ({currency}) *</label>
                  <input type="number" min="0" required className={inputCls} value={form.base_salary} onChange={e => set("base_salary", e.target.value)} placeholder={`e.g. ${currency === "AED" ? "18000" : currency === "SAR" ? "15000" : "5000"}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Monthly Housing Allowance ({currency}) <span className="normal-case font-normal text-muted-foreground/60">optional</span></label>
                    <input type="number" min="0" className={inputCls} value={form.housing_allowance} onChange={e => set("housing_allowance", e.target.value)} placeholder="e.g. 4000" />
                  </div>
                  <div>
                    <label className={labelCls}>Annual Bonus ({currency}) <span className="normal-case font-normal text-muted-foreground/60">optional</span></label>
                    <input type="number" min="0" className={inputCls} value={form.annual_bonus} onChange={e => set("annual_bonus", e.target.value)} placeholder="e.g. 20000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Nationality <span className="normal-case font-normal text-muted-foreground/60">optional</span></label>
                    <input type="text" className={inputCls} value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="e.g. Indian, British, Egyptian" />
                  </div>
                  <div>
                    <label className={labelCls}>Company Size <span className="normal-case font-normal text-muted-foreground/60">optional</span></label>
                    <select className={inputCls} value={form.company_size} onChange={e => set("company_size", e.target.value)}>
                      <option value="">Select...</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                    </select>
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
                )}

                <button type="submit" disabled={status === "loading"}
                  className="w-full rounded-full bg-accent py-3 text-accent-foreground font-semibold shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none">
                  {status === "loading" ? "Submitting..." : "Submit anonymously"}
                </button>
              </form>

              {/* Reassurance */}
              <div className="mt-5 bg-muted/40 border border-border rounded-xl p-5 space-y-1.5 text-sm text-muted-foreground">
                <p>Your submission is anonymous.</p>
                <p>We never contact you or store identifying information.</p>
                <p>We use the data only to improve public salary benchmarks.</p>
              </div>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
