'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    category: CATEGORIES[0],
    author: 'Addify Team',
    read_time: '5 min',
    image: '',
    image_alt: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    draft: true,
  });

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && typeof value === 'string' && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function insertAtCursor(text: string) {
    const ta = contentRef.current;
    if (!ta) {
      setForm((prev) => ({ ...prev, content: prev.content + '\n' + text }));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setForm((prev) => ({
      ...prev,
      content: prev.content.slice(0, start) + text + prev.content.slice(end),
    }));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent, publishNow: boolean) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, draft: !publishNow }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save post');
        setBusy(false);
        return;
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-1">New Blog Post</h1>
        <p className="text-sm text-muted-foreground">Write in Markdown. Supports headings, bold, lists, links.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Title + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="How to Negotiate Your Gulf Salary"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              required
              placeholder="how-to-negotiate-gulf-salary"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">addify.ae/blog/{form.slug || '...'}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Description * <span className="normal-case font-normal">(shown in card previews)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
            rows={2}
            placeholder="One or two sentences summarising the post."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
          />
        </div>

        {/* Category + Author + Read time + Date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Author</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Read time</label>
            <input
              type="text"
              value={form.read_time}
              onChange={(e) => set('read_time', e.target.value)}
              placeholder="7 min"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Hero image */}
        <ImageUploader
          value={form.image}
          altValue={form.image_alt}
          onChangeUrl={(url) => set('image', url)}
          onChangeAlt={(alt) => set('image_alt', alt)}
        />

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Content * <span className="normal-case font-normal">(Markdown)</span>
          </label>
          <InsertButtonLink onInsert={insertAtCursor} />
          <textarea
            ref={contentRef}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            required
            rows={24}
            placeholder={`## Introduction\n\nStart writing here...\n\n## Section Heading\n\nMore content...`}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-y font-mono leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={busy}
            className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={busy}
            className="px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            {busy ? 'Publishing...' : 'Publish Now'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            disabled={busy}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
