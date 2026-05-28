'use client';

import { ResumeContact } from '@/types/resume';

interface Props {
  contact: ResumeContact;
  onChange: (contact: ResumeContact) => void;
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function ContactSection({ contact, onChange }: Props) {
  function set(key: keyof ResumeContact, value: string) {
    onChange({ ...contact, [key]: value });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Full Name *</label>
          <input type="text" value={contact.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Sara Al Mansoori" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Job Title *</label>
          <input type="text" value={contact.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="Senior Marketing Manager" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Email</label>
          <input type="email" value={contact.email} onChange={(e) => set('email', e.target.value)} placeholder="sara@example.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Phone</label>
          <input type="text" value={contact.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 50 123 4567" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location</label>
          <input type="text" value={contact.location} onChange={(e) => set('location', e.target.value)} placeholder="Dubai, UAE" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">LinkedIn</label>
          <input type="text" value={contact.linkedin ?? ''} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Website <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" value={contact.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="yoursite.com" className={inputCls} />
      </div>
    </div>
  );
}
