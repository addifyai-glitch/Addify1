import { ResumeData } from '@/types/resume';

export function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page bg-white text-slate-900 px-10 py-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Header — name left, contact right */}
      <header className="flex justify-between items-start gap-6 mb-7 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.contact.fullName || 'Your Name'}</h1>
          {data.contact.jobTitle && <p className="text-sm text-slate-500 mt-0.5 font-light">{data.contact.jobTitle}</p>}
        </div>
        <div className="text-right text-xs text-slate-500 space-y-0.5 shrink-0 mt-0.5">
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.linkedin && <div>{data.contact.linkedin}</div>}
          {data.contact.website && <div>{data.contact.website}</div>}
        </div>
      </header>

      {/* Two-column feel: label in left margin, content on right */}
      <div className="space-y-5">
        {data.summary && (
          <Row label="Profile">
            <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
          </Row>
        )}

        {data.experience.length > 0 && (
          <Row label="Experience">
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <span className="text-sm font-semibold text-slate-900">{exp.role}</span>
                    <span className="text-xs text-slate-400 shrink-0">{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="space-y-0.5">
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="mt-2 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Row>
        )}

        {data.education.length > 0 && (
          <Row label="Education">
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <span className="text-sm font-semibold text-slate-900">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                    <span className="text-xs text-slate-400 shrink-0">{edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-500">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                </div>
              ))}
            </div>
          </Row>
        )}

        {data.skills.length > 0 && (
          <Row label="Skills">
            <p className="text-sm text-slate-700 leading-relaxed">{data.skills.join('  ·  ')}</p>
          </Row>
        )}

        {data.projects.length > 0 && (
          <Row label="Projects">
            <div className="space-y-2">
              {data.projects.map((p) => (
                <div key={p.id}>
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                  {p.link && <span className="text-xs text-slate-400 ml-2">{p.link}</span>}
                  <p className="text-sm text-slate-700">{p.description}</p>
                </div>
              ))}
            </div>
          </Row>
        )}

        {(data.languages.length > 0 || data.certifications.length > 0) && (
          <div className="flex flex-wrap gap-8">
            {data.languages.length > 0 && (
              <div className="flex-1 min-w-[160px]">
                <Row label="Languages">
                  <p className="text-sm text-slate-700">{data.languages.join(', ')}</p>
                </Row>
              </div>
            )}
            {data.certifications.length > 0 && (
              <div className="flex-1 min-w-[160px]">
                <Row label="Certs">
                  <p className="text-sm text-slate-700">{data.certifications.join(', ')}</p>
                </Row>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-5 items-start">
      <div className="pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
