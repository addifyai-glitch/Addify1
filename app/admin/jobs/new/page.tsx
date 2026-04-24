"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITY_GROUPS } from "@/data/cities";
import { Button } from "@/components/ui/button";

const EXPERIENCE_LEVELS = ["0-2 years", "3-5 years", "6-10 years", "11-15 years", "16+ years"];

export default function NewJobPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    title: "", company: "", city: "", country: "", currency: "AED",
    salary_min: "", salary_max: "", experience_level: "", apply_url: "",
    description: "", featured: false, expiry_days: "30",
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          source: "admin",
          approved: true,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTimeout(() => router.push("/admin/jobs"), 1500);
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground mb-8">Post New Job</h1>

      {status === "success" && (
        <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-xl text-sm text-success font-semibold">
          ✓ Job published successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Job Title *</label>
            <input className={inputClass} required value={form.title} onChange={e => set("title", e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div>
            <label className={labelClass}>Company *</label>
            <input className={inputClass} required value={form.company} onChange={e => set("company", e.target.value)} placeholder="Noon.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>City *</label>
            <select className={inputClass} required value={form.city} onChange={e => {
              const city = e.target.value;
              const country = CITY_GROUPS.find(g => g.cities.some(c => c.name === city))?.country ?? "";
              const currency = CITY_GROUPS.find(g => g.cities.some(c => c.name === city))?.currency ?? "AED";
              setForm(f => ({ ...f, city, country, currency }));
            }}>
              <option value="">Select city…</option>
              {CITY_GROUPS.map(g => (
                <optgroup key={g.country} label={g.country}>
                  {g.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Experience Level</label>
            <select className={inputClass} value={form.experience_level} onChange={e => set("experience_level", e.target.value)}>
              <option value="">Any</option>
              {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Currency</label>
            <input className={inputClass} value={form.currency} onChange={e => set("currency", e.target.value)} placeholder="AED" />
          </div>
          <div>
            <label className={labelClass}>Salary Min</label>
            <input className={inputClass} type="number" value={form.salary_min} onChange={e => set("salary_min", e.target.value)} placeholder="15000" />
          </div>
          <div>
            <label className={labelClass}>Salary Max</label>
            <input className={inputClass} type="number" value={form.salary_max} onChange={e => set("salary_max", e.target.value)} placeholder="25000" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Apply URL *</label>
          <input className={inputClass} type="url" required value={form.apply_url} onChange={e => set("apply_url", e.target.value)} placeholder="https://careers.example.com/apply" />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={4} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Role overview, responsibilities, requirements…" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Expires in (days)</label>
            <input className={inputClass} type="number" min="1" max="90" value={form.expiry_days} onChange={e => set("expiry_days", e.target.value)} />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set("featured", e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-foreground font-medium">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={status === "loading"} className="flex-1 justify-center">
            {status === "loading" ? "Publishing…" : "Publish Job"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
        {status === "error" && <p className="text-sm text-destructive text-center">Failed to publish. Check console.</p>}
      </form>
    </div>
  );
}
