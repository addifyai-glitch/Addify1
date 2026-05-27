'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ImageUploader } from '@/components/admin/image-uploader';
import { InsertButtonLink } from '@/components/admin/insert-button-link';

const CATEGORIES = [
  // Career & Jobs
  'Salary & Compensation',
  'CV and Applications',
  'Job Search',
  'Career Advice',
  'Career Growth',
  'Negotiation',
  // Gulf Regions
  'UAE Essentials',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  // Life & Relocation
  'Visa & Relocation',
  'Living and Working',
  // Industry
  'Market Insights',
  'Industry Guides',
  'Technology',
  'Finance',
  'Healthcare',
  'Construction & Engineering',
  // New
  'AI & Future of Work',
  'Promotions & Perks',
  'News',
];

type FormState = {
  title: string;
  slug: string;
  description: string;
  category: string;
  author: string;
  read_time: string;
  image: string;
  image_alt: string;
  date: string;
  content: string;
  draft: boolean;
};

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/blog/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          description: data.description ?? '',
          category: data.category ?? CATEGORIES[0],
          author: data.author ?? 'Addify Team',
          read_time: data.read_time ?? '5 min',
          image: data.image ?? '',
          image_alt: data.image_alt ?? '',
          date: data.date ?? new Date().toISOString().split('T')[0],
          content: data.content ?? '',
          draft: data.draft ?? true,
        });
      } else {
        setError('Failed to load post');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function insertAtCursor(text: string) {
    const ta = contentRef.current;
    if (!ta || !form) {
      setForm((prev) => prev ? { ...prev, content: prev.content + '\n' + text } : prev);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setForm((prev) => prev ? ({
      ...prev,
      content: prev.content.slice(0, start) + text + prev.content.slice(end),
    }) : prev);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    }, 0);
  }

  async function handleSave(publishNow?: boolean) {
    if (!form) return;
    setBusy(true);
    setError(null);
    setSaved(false);

    const payload = publishNow !== undefined
      ? { ...form, draft: !publishNow }
      : form;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Save failed');
      } else {
        setSaved(true);
        if (publishNow === true) {
          router.push('/admin/blog');
        } else if (publishNow === false) {
          setForm((prev) => prev ? { ...prev, draft: true } : prev);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post permanently?')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/blog');
    } else {
      const data = await res.json();
      setError(data.error || 'Delete failed');
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  if (!form) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Edit Post</h1>
          <p className="text-sm text-muted-foreground">
            Status: <span className={form.draft ? 'text-muted-foreground' : 'text-success font-semibold'}>
              {form.draft ? 'Draft' : 'Published'}
            </span>
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-xs text-destructive hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          Delete post
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          Saved.
        </div>
      )}

      <form className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Description *</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required rows={2}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Category *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Author</label>
            <input type="text" value={form.author} onChange={(e) => set('author', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Read time</label>
            <input type="text" value={form.read_time} onChange={(e) => set('read_time', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>

        <ImageUploader
          value={form.image}
          altValue={form.image_alt}
          onChangeUrl={(url) => set('image', url)}
          onChangeAlt={(alt) => set('image_alt', alt)}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Content * (Markdown)</label>
          <InsertButtonLink onInsert={insertAtCursor} />
          <textarea ref={contentRef} value={form.content} onChange={(e) => set('content', e.target.value)} required rows={24}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-y font-mono leading-relaxed" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => handleSave()} disabled={busy}
            className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50">
            {busy ? 'Saving...' : 'Save'}
          </button>
          {form.draft ? (
            <button type="button" onClick={() => handleSave(true)} disabled={busy}
              className="px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
              Publish Now
            </button>
          ) : (
            <button type="button" onClick={() => handleSave(false)} disabled={busy}
              className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
              Unpublish
            </button>
          )}
          <button type="button" onClick={() => router.push('/admin/blog')} disabled={busy}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
