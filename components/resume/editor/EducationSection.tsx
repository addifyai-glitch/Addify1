'use client';

import { ResumeEducation } from '@/types/resume';

interface Props {
  education: ResumeEducation[];
  onChange: (education: ResumeEducation[]) => void;
}

function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
  return copy;
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

function newEntry(): ResumeEducation {
  return { id: `edu-${Date.now()}`, institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', note: '' };
}

export function EducationSection({ education, onChange }: Props) {
  function updateEntry(i: number, patch: Partial<ResumeEducation>) {
    const copy = [...education];
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  }

  return (
    <div className="space-y-4">
      {education.map((edu, i) => (
        <div key={edu.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Entry {i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onChange(moveItem(education, i, -1))} disabled={i === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move up">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(moveItem(education, i, 1))} disabled={i === education.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move down">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(education.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Remove">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Institution</label>
              <input type="text" value={edu.institution} onChange={(e) => updateEntry(i, { institution: e.target.value })} placeholder="American University of Sharjah" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Degree</label>
              <input type="text" value={edu.degree} onChange={(e) => updateEntry(i, { degree: e.target.value })} placeholder="Bachelor of Business Administration" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Field <span className="normal-case font-normal">(optional)</span></label>
              <input type="text" value={edu.field ?? ''} onChange={(e) => updateEntry(i, { field: e.target.value })} placeholder="Marketing" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Start Year</label>
              <input type="text" value={edu.startDate} onChange={(e) => updateEntry(i, { startDate: e.target.value })} placeholder="2012" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">End Year</label>
              <input type="text" value={edu.endDate} onChange={(e) => updateEntry(i, { endDate: e.target.value })} placeholder="2016" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location <span className="normal-case font-normal">(optional)</span></label>
              <input type="text" value={edu.location ?? ''} onChange={(e) => updateEntry(i, { location: e.target.value })} placeholder="Sharjah, UAE" className={inputCls} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...education, newEntry()])}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-colors">
        + Add Education
      </button>
    </div>
  );
}
