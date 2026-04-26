"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Mail, Clock } from "lucide-react";

const SUBJECTS = ["General", "Feedback", "Press", "Business", "Privacy", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Contact</p>
            <h1 className="font-display text-4xl text-foreground mb-3">Get in touch</h1>
            <p className="text-muted-foreground mb-12">
              Questions, feedback, partnership ideas. We read every message.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form */}
              <div className="md:col-span-2">
                {status === "success" ? (
                  <div className="p-8 bg-success/10 border border-success/30 rounded-2xl text-center">
                    <p className="text-lg font-semibold text-foreground mb-2">Message sent ✓</p>
                    <p className="text-sm text-muted-foreground">We&apos;ll reply to {form.email} within 48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input className={inputCls} required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
                      </div>
                      <div>
                        <label className={labelCls}>Email *</label>
                        <input className={inputCls} type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Subject</label>
                      <select className={inputCls} value={form.subject} onChange={e => set("subject", e.target.value)}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Message *</label>
                      <textarea className={inputCls} rows={5} required minLength={20} value={form.message} onChange={e => set("message", e.target.value)} placeholder="How can we help?" />
                    </div>
                    {status === "error" && <p className="text-sm text-destructive">Failed to send. Please email us directly.</p>}
                    <Button type="submit" className="justify-center" disabled={status === "loading"}>
                      {status === "loading" ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Info card */}
              <div className="flex flex-col gap-5">
                {[
                  { Icon: Mail, label: "Email", value: "hello@addify.ae" },
                  { Icon: Clock, label: "Response time", value: "Within 48 hours" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-5 shadow-soft">
                    <div className="flex items-center gap-3 mb-1">
                      <Icon size={16} className="text-accent" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
