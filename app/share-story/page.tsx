"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { CITIES } from "@/data/cities";

export default function ShareStoryPage() {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "", role: "", city: "", quote: "", permission: false,
  });

  function set(k: string, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const canSubmit = !!(form.name && form.role && form.city && form.quote &&
    form.quote.length >= 50 && form.quote.length <= 500 && form.permission);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating }),
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
        <Container className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Community</p>
          <h1 className="font-display text-4xl text-foreground mb-3">Share your story</h1>
          <p className="text-muted-foreground mb-10">
            Tell us how Addify helped you. We review every submission and publish the best ones on the homepage.
          </p>

          {status === "success" ? (
            <div className="p-8 bg-success/10 border border-success/30 rounded-2xl text-center">
              <p className="text-lg font-semibold text-foreground mb-2">Thanks for sharing.</p>
              <p className="text-sm text-muted-foreground">
                We will review your story and publish it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
              {/* Rating */}
              <div>
                <p className={labelCls}>Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                    >
                      <Star
                        size={24}
                        className={`transition-colors ${(hovered || rating) >= s ? "fill-accent text-accent" : "text-border"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Your name *</label>
                  <input className={inputCls} required value={form.name}
                    onChange={(e) => set("name", e.target.value)} placeholder="Ahmad R." />
                </div>
                <div>
                  <label className={labelCls}>Your role *</label>
                  <input className={inputCls} required value={form.role}
                    onChange={(e) => set("role", e.target.value)} placeholder="Software Engineer" />
                </div>
              </div>

              <div>
                <label className={labelCls}>City *</label>
                <select className={inputCls} required value={form.city}
                  onChange={(e) => set("city", e.target.value)}>
                  <option value="">Select your city...</option>
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}, {c.country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Your story * ({form.quote.length}/500 chars, min 50)</label>
                <textarea
                  className={inputCls}
                  rows={5}
                  required
                  minLength={50}
                  maxLength={500}
                  value={form.quote}
                  onChange={(e) => set("quote", e.target.value)}
                  placeholder="Tell us how Addify helped you. For example: what you discovered, what you negotiated, or what changed."
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-accent"
                  checked={form.permission}
                  onChange={(e) => set("permission", e.target.checked)}
                  required
                />
                <span className="text-sm text-muted-foreground">
                  You can use this on your site and in marketing materials. I confirm this is my honest experience.
                </span>
              </label>

              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}

              <Button type="submit" disabled={!canSubmit || status === "loading"} className="w-full justify-center">
                {status === "loading" ? "Submitting..." : "Submit my story"}
              </Button>
            </form>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
