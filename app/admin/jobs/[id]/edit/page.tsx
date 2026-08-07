"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CITY_GROUPS } from "@/data/cities";

const EXPERIENCE_LEVELS = [
  { value: "Entry",     label: "Entry (0-2 years)" },
  { value: "Mid",       label: "Mid (3-5 years)" },
  { value: "Senior",    label: "Senior (6-10 years)" },
  { value: "Executive", label: "Executive (10+ years)" },
];

const WORK_TYPES = ["On-site", "Remote", "Hybrid"];

type FormState = {
  title: string;
  company: string;
  city: string;
  country: string;
  currency: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  experience_level: string;
  apply_url: string;
  description: string;
  is_featured: boolean;
  expires_at: string;
};

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.title ?? "",
          company: data.company ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
          currency: data.currency ?? "AED",
          employment_type: data.employment_type ?? "On-site",
          salary_min: data.salary_min != null ? String(data.salary_min) : "",
          salary_max: data.salary_max != null ? String(data.salary_max) : "",
          experience_level: data.experience_level ?? "",
          apply_url: data.apply_url ?? "",
          description: data.description ?? "",
          is_featured: !!data.is_featured,
          expires_at: data.expires_at ? data.expires_at.split("T")[0] : "",
        });
      } else {
        setError("Failed to load job");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this job permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/jobs");
    } else {
      const data = await res.json();
      setError(data.error || "Delete failed");
      setBusy(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5";

  if (loading) return <div className="text-muted-foreground text-sm">Loading...</div>;

  if (!form) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
        {error || "Job not found"}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Edit Job</h1>
          <p className="text-sm text-muted-foreground">{form.title}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-xs text-destructive hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          Delete job
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-xl text-sm text-success font-semibold">
          ✓ Saved successfully.
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-8 shadow-soft flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Job Title *</label>
            <input className={inputClass} required value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input className={inputClass} value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Work Type</label>
            <select className={inputClass} value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
              {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>City <span className="normal-case font-normal">(optional for remote roles)</span></label>
            <select className={inputClass} value={form.city} onChange={(e) => {
              const city = e.target.value;
              const group = CITY_GROUPS.find((g) => g.cities.some((c) => c.name === city));
              setForm((f) => f ? { ...f, city, country: group?.country ?? f.country, currency: group?.currency ?? f.currency } : f);
            }}>
              <option value="">Select city…</option>
              {CITY_GROUPS.map((g) => (
                <optgroup key={g.country} label={g.country}>
                  {g.cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Experience Level</label>
          <select className={inputClass} value={form.experience_level} onChange={(e) => set("experience_level", e.target.value)}>
            <option value="">— not set —</option>
            {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Currency</label>
            <input className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Salary Min</label>
            <input className={inputClass} type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Salary Max</label>
            <input className={inputClass} type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Apply URL *</label>
          <input className={inputClass} type="url" required value={form.apply_url} onChange={(e) => set("apply_url", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Expires on</label>
            <input className={inputClass} type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-foreground font-medium">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="flex-1 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/jobs")}
            disabled={busy}
            className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
