'use client';

import { ResumeProject } from '@/types/resume';

interface Props {
  projects: ResumeProject[];
  onChange: (projects: ResumeProject[]) => void;
}

function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
  return copy;
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

function newEntry(): ResumeProject {
  return { id: `proj-${Date.now()}`, name: '', description: '', link: '' };
}

export function ProjectsSection({ projects, onChange }: Props) {
  function updateEntry(i: number, patch: Partial<ResumeProject>) {
    const copy = [...projects];
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  }

  return (
    <div className="space-y-4">
      {projects.map((proj, i) => (
        <div key={proj.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Project {i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onChange(moveItem(projects, i, -1))} disabled={i === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(moveItem(projects, i, 1))} disabled={i === projects.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" onClick={() => onChange(projects.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Project Name</label>
            <input type="text" value={proj.name} onChange={(e) => updateEntry(i, { name: e.target.value })} placeholder="Addify Jobs Platform" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</label>
            <textarea value={proj.description} onChange={(e) => updateEntry(i, { description: e.target.value })} rows={2} placeholder="Brief description of what you built and the impact." className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Link <span className="normal-case font-normal">(optional)</span></label>
            <input type="text" value={proj.link ?? ''} onChange={(e) => updateEntry(i, { link: e.target.value })} placeholder="github.com/..." className={inputCls} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...projects, newEntry()])}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-colors">
        + Add Project
      </button>
    </div>
  );
}
