'use client';

import { ResumeExperience } from '@/types/resume';

interface Props {
  experience: ResumeExperience[];
  onChange: (experience: ResumeExperience[]) => void;
}

function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
  return copy;
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

function newEntry(): ResumeExperience {
  return { id: `exp-${Date.now()}`, company: '', role: '', location: '', startDate: '', endDate: '', bullets: [''] };
}

export function ExperienceSection({ experience, onChange }: Props) {
  function updateEntry(i: number, patch: Partial<ResumeExperience>) {
    const copy = [...experience];
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  }

  function updateBullet(i: number, bi: number, value: string) {
    const bullets = [...experience[i].bullets];
    bullets[bi] = value;
    updateEntry(i, { bullets });
  }

  function addBullet(i: number) {
    updateEntry(i, { bullets: [...experience[i].bullets, ''] });
  }

  function removeBullet(i: number, bi: number) {
    const bullets = experience[i].bullets.filter((_, idx) => idx !== bi);
    updateEntry(i, { bullets: bullets.length ? bullets : [''] });
  }

  return (
    <div className="space-y-4">
      {experience.map((exp, i) => (
        <div key={exp.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Position {i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onChange(moveItem(experience, i, -1))} disabled={i === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move up">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(moveItem(experience, i, 1))} disabled={i === experience.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move down">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(experience.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Remove">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Role / Title</label>
              <input type="text" value={exp.role} onChange={(e) => updateEntry(i, { role: e.target.value })} placeholder="Senior Marketing Manager" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Company</label>
              <input type="text" value={exp.company} onChange={(e) => updateEntry(i, { company: e.target.value })} placeholder="Gulf Retail Group" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Start Date</label>
              <input type="text" value={exp.startDate} onChange={(e) => updateEntry(i, { startDate: e.target.value })} placeholder="Mar 2021" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">End Date</label>
              <input type="text" value={exp.endDate} onChange={(e) => updateEntry(i, { endDate: e.target.value })} placeholder="Present" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location <span className="normal-case font-normal">(optional)</span></label>
              <input type="text" value={exp.location ?? ''} onChange={(e) => updateEntry(i, { location: e.target.value })} placeholder="Dubai, UAE" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Bullet Points</label>
            <div className="space-y-2">
              {exp.bullets.map((b, bi) => (
                <div key={bi} className="flex items-start gap-2">
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                  <input type="text" value={b} onChange={(e) => updateBullet(i, bi, e.target.value)} placeholder="Describe an achievement..." className={`${inputCls} flex-1`} />
                  <button type="button" onClick={() => removeBullet(i, bi)} disabled={exp.bullets.length === 1 && !b} className="mt-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addBullet(i)} className="text-xs text-accent hover:opacity-70 transition-opacity font-semibold">+ Add bullet</button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...experience, newEntry()])}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-colors">
        + Add Position
      </button>
    </div>
  );
}
