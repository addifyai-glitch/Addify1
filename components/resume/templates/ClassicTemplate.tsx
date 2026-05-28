import { ResumeData } from '@/types/resume';

export function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page bg-white text-slate-900 p-10" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Centered header */}
      <header className="text-center mb-6 pb-4 border-b border-slate-400">
        <h1 className="text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {data.contact.fullName || 'Your Name'}
        </h1>
        {data.contact.jobTitle && (
          <p className="text-base text-slate-600 italic mb-2">{data.contact.jobTitle}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.email && data.contact.phone && <span className="text-slate-300">|</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.phone && data.contact.location && <span className="text-slate-300">|</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.location && data.contact.linkedin && <span className="text-slate-300">|</span>}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
          {data.contact.linkedin && data.contact.website && <span className="text-slate-300">|</span>}
          {data.contact.website && <span>{data.contact.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Professional Summary</h2>
          <hr className="border-slate-400 mb-3" />
          <p className="text-sm leading-relaxed text-slate-700 text-center">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Experience</h2>
          <hr className="border-slate-400 mb-3" />
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <h3 className="font-bold text-sm">{exp.role}</h3>
                <span className="text-xs text-slate-500 italic shrink-0">{exp.startDate}{exp.startDate && exp.endDate ? ' - ' : ''}{exp.endDate}</span>
              </div>
              <p className="text-sm text-slate-600 italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-5 text-sm mt-1.5 space-y-0.5 text-slate-700">
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
          <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Education</h2>
          <hr className="border-slate-400 mb-3" />
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <h3 className="font-bold text-sm">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h3>
                <span className="text-xs text-slate-500 italic shrink-0">{edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}</span>
              </div>
              <p className="text-sm text-slate-600 italic">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Skills</h2>
          <hr className="border-slate-400 mb-3" />
          <p className="text-sm text-slate-700 text-center">{data.skills.join(' · ')}</p>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Projects</h2>
          <hr className="border-slate-400 mb-3" />
          {data.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <h3 className="font-bold text-sm">{p.name}{p.link ? <span className="font-normal text-slate-500 italic ml-2 text-xs">{p.link}</span> : null}</h3>
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
              <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Languages</h2>
              <hr className="border-slate-400 mb-2" />
              <p className="text-sm text-slate-700 text-center">{data.languages.join(', ')}</p>
            </section>
          )}
          {data.certifications.length > 0 && (
            <section className="flex-1 min-w-[160px]">
              <h2 className="text-sm font-bold text-center uppercase tracking-widest text-slate-800 mb-1">Certifications</h2>
              <hr className="border-slate-400 mb-2" />
              <p className="text-sm text-slate-700 text-center">{data.certifications.join(', ')}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
