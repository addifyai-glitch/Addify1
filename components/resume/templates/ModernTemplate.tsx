import { ResumeData } from '@/types/resume';

export function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page bg-white text-slate-900 p-10" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{data.contact.fullName || 'Your Name'}</h1>
        {data.contact.jobTitle && <p className="text-lg text-slate-500 mt-1">{data.contact.jobTitle}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 mt-2">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
          {data.contact.website && <span>{data.contact.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 border-b border-slate-200 pb-1">Summary</h2>
          <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-3 border-b border-slate-200 pb-1">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <h3 className="font-bold text-sm">{exp.role}</h3>
                <span className="text-xs text-slate-500 shrink-0">{exp.startDate}{exp.startDate && exp.endDate ? ' - ' : ''}{exp.endDate}</span>
              </div>
              <p className="text-sm text-slate-500">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm mt-1 space-y-0.5 text-slate-700">
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-3 border-b border-slate-200 pb-1">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <h3 className="font-bold text-sm">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h3>
                <span className="text-xs text-slate-500 shrink-0">{edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}</span>
              </div>
              <p className="text-sm text-slate-500">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 border-b border-slate-200 pb-1">Skills</h2>
          <p className="text-sm text-slate-700">{data.skills.join(' · ')}</p>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-3 border-b border-slate-200 pb-1">Projects</h2>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <h3 className="font-bold text-sm">{p.name}{p.link ? <span className="font-normal text-slate-500 ml-2 text-xs">{p.link}</span> : null}</h3>
              <p className="text-sm text-slate-700">{p.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Languages + Certifications */}
      {(data.languages.length > 0 || data.certifications.length > 0) && (
        <div className="flex flex-wrap gap-8">
          {data.languages.length > 0 && (
            <section className="flex-1 min-w-[160px]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 border-b border-slate-200 pb-1">Languages</h2>
              <p className="text-sm text-slate-700">{data.languages.join(', ')}</p>
            </section>
          )}
          {data.certifications.length > 0 && (
            <section className="flex-1 min-w-[160px]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 border-b border-slate-200 pb-1">Certifications</h2>
              <p className="text-sm text-slate-700">{data.certifications.join(', ')}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
