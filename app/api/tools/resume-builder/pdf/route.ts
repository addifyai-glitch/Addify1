import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData, TemplateId } from '@/types/resume';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Log which browser strategy is in use (helps diagnose Puppeteer issues per env)
console.log(
  `[pdf-route] Browser strategy: ${process.env.DEPLOY_ENV === 'hetzner' ? 'local-chromium' : 'sparticuz-chromium'}`
);

function esc(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bullets(b: string[]): string {
  return b.filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('');
}

// ─── Modern ──────────────────────────────────────────────────────────────────
function renderModern(d: ResumeData): string {
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.4; background: white; }
    .page { padding: 40px; background: white; }
    h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
    .job-title { font-size: 15px; color: #64748b; margin-top: 3px; }
    .contact-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #64748b; margin-top: 6px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
    h2 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #334155;
         border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 10px; }
    section { margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px; }
    .role { font-size: 13px; font-weight: 700; }
    .date { font-size: 11px; color: #64748b; white-space: nowrap; }
    .company { font-size: 12px; color: #64748b; }
    ul { list-style: disc; padding-left: 16px; margin-top: 4px; }
    li { font-size: 12px; color: #334155; margin-bottom: 2px; }
    .body-text { font-size: 12px; color: #334155; line-height: 1.5; }
    .two-col { display: flex; gap: 24px; }
    .two-col > div { flex: 1; }
    .exp-block { margin-bottom: 12px; }
    .edu-block { margin-bottom: 8px; }
  `;

  const exp = d.experience.length === 0 ? '' : `
    <section>
      <h2>Experience</h2>
      ${d.experience.map((e) => `
        <div class="exp-block">
          <div class="row">
            <span class="role">${esc(e.role)}</span>
            <span class="date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
          </div>
          <div class="company">${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ''}</div>
          ${e.bullets.filter(Boolean).length ? `<ul>${bullets(e.bullets)}</ul>` : ''}
        </div>
      `).join('')}
    </section>`;

  const edu = d.education.length === 0 ? '' : `
    <section>
      <h2>Education</h2>
      ${d.education.map((e) => `
        <div class="edu-block">
          <div class="row">
            <span class="role">${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</span>
            <span class="date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
          </div>
          <div class="company">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}</div>
        </div>
      `).join('')}
    </section>`;

  const skills = d.skills.length === 0 ? '' : `
    <section><h2>Skills</h2><p class="body-text">${d.skills.map(esc).join(' · ')}</p></section>`;

  const projects = d.projects.length === 0 ? '' : `
    <section>
      <h2>Projects</h2>
      ${d.projects.map((p) => `
        <div class="edu-block">
          <div class="role" style="font-size:12px">${esc(p.name)}${p.link ? `<span style="font-weight:400;color:#94a3b8;font-size:10px;margin-left:6px">${esc(p.link)}</span>` : ''}</div>
          <p class="body-text">${esc(p.description)}</p>
        </div>
      `).join('')}
    </section>`;

  const langCert = (d.languages.length > 0 || d.certifications.length > 0) ? `
    <div class="two-col">
      ${d.languages.length > 0 ? `<div><section><h2>Languages</h2><p class="body-text">${d.languages.map(esc).join(', ')}</p></section></div>` : ''}
      ${d.certifications.length > 0 ? `<div><section><h2>Certifications</h2><p class="body-text">${d.certifications.map(esc).join(', ')}</p></section></div>` : ''}
    </div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body><div class="page">
    <header class="header">
      ${d.contact.photo ? `<img src="${d.contact.photo}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;float:right;margin-left:16px;" />` : ''}
      <h1>${esc(d.contact.fullName) || 'Your Name'}</h1>
      ${d.contact.jobTitle ? `<p class="job-title">${esc(d.contact.jobTitle)}</p>` : ''}
      <div class="contact-row">
        ${d.contact.email ? `<span>${esc(d.contact.email)}</span>` : ''}
        ${d.contact.phone ? `<span>${esc(d.contact.phone)}</span>` : ''}
        ${d.contact.location ? `<span>${esc(d.contact.location)}</span>` : ''}
        ${d.contact.linkedin ? `<span>${esc(d.contact.linkedin)}</span>` : ''}
        ${d.contact.website ? `<span>${esc(d.contact.website)}</span>` : ''}
      </div>
      <div style="clear:both;"></div>
    </header>
    ${d.summary ? `<section><h2>Summary</h2><p class="body-text">${esc(d.summary)}</p></section>` : ''}
    ${exp}${edu}${skills}${projects}${langCert}
  </div></body></html>`;
}

// ─── Classic ─────────────────────────────────────────────────────────────────
function renderClassic(d: ResumeData): string {
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; color: #0f172a; line-height: 1.4; background: white; }
    .page { padding: 40px; background: white; }
    h1 { font-size: 30px; font-weight: 700; text-align: center; }
    .job-title { font-size: 14px; color: #475569; font-style: italic; text-align: center; margin-top: 3px; }
    .contact-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; font-size: 11px;
                   color: #64748b; margin-top: 6px; }
    .sep { color: #cbd5e1; }
    .header { border-bottom: 1px solid #94a3b8; padding-bottom: 14px; margin-bottom: 18px; }
    h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
         color: #1e293b; text-align: center; margin-bottom: 4px; }
    hr { border: none; border-top: 1px solid #94a3b8; margin-bottom: 12px; }
    section { margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px; }
    .role { font-size: 13px; font-weight: 700; }
    .date { font-size: 11px; color: #64748b; font-style: italic; white-space: nowrap; }
    .company { font-size: 12px; color: #475569; font-style: italic; }
    ul { list-style: disc; padding-left: 20px; margin-top: 6px; }
    li { font-size: 12px; color: #334155; margin-bottom: 2px; }
    .body-text { font-size: 12px; color: #334155; line-height: 1.5; text-align: center; }
    .two-col { display: flex; gap: 24px; }
    .two-col > div { flex: 1; }
    .block { margin-bottom: 12px; }
  `;

  const contacts: string[] = [];
  if (d.contact.email) contacts.push(`<span>${esc(d.contact.email)}</span>`);
  if (d.contact.phone) { if (contacts.length) contacts.push('<span class="sep">|</span>'); contacts.push(`<span>${esc(d.contact.phone)}</span>`); }
  if (d.contact.location) { if (contacts.length) contacts.push('<span class="sep">|</span>'); contacts.push(`<span>${esc(d.contact.location)}</span>`); }
  if (d.contact.linkedin) { if (contacts.length) contacts.push('<span class="sep">|</span>'); contacts.push(`<span>${esc(d.contact.linkedin)}</span>`); }
  if (d.contact.website) { if (contacts.length) contacts.push('<span class="sep">|</span>'); contacts.push(`<span>${esc(d.contact.website)}</span>`); }

  const sec = (label: string, body: string) => `<section><h2>${label}</h2><hr/>${body}</section>`;

  const exp = d.experience.length === 0 ? '' : sec('Experience', d.experience.map((e) => `
    <div class="block">
      <div class="row">
        <span class="role">${esc(e.role)}</span>
        <span class="date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
      </div>
      <div class="company">${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ''}</div>
      ${e.bullets.filter(Boolean).length ? `<ul>${bullets(e.bullets)}</ul>` : ''}
    </div>`).join(''));

  const edu = d.education.length === 0 ? '' : sec('Education', d.education.map((e) => `
    <div class="block">
      <div class="row">
        <span class="role">${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</span>
        <span class="date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
      </div>
      <div class="company">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}</div>
    </div>`).join(''));

  const skills = d.skills.length === 0 ? '' : sec('Skills', `<p class="body-text">${d.skills.map(esc).join(' · ')}</p>`);

  const projects = d.projects.length === 0 ? '' : sec('Projects', d.projects.map((p) => `
    <div class="block">
      <div class="role" style="font-size:12px;text-align:center">${esc(p.name)}</div>
      <p class="body-text">${esc(p.description)}</p>
    </div>`).join(''));

  const langCert = (d.languages.length > 0 || d.certifications.length > 0) ? `
    <div class="two-col">
      ${d.languages.length > 0 ? `<div>${sec('Languages', `<p class="body-text">${d.languages.map(esc).join(', ')}</p>`)}</div>` : ''}
      ${d.certifications.length > 0 ? `<div>${sec('Certifications', `<p class="body-text">${d.certifications.map(esc).join(', ')}</p>`)}</div>` : ''}
    </div>` : '';

  const summary = d.summary ? sec('Professional Summary', `<p class="body-text">${esc(d.summary)}</p>`) : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body><div class="page">
    <header class="header">
      ${d.contact.photo ? `<img src="${d.contact.photo}" alt="" style="width:70px;height:90px;object-fit:cover;float:left;margin-right:16px;border:1px solid #cbd5e1;" />` : ''}
      <h1>${esc(d.contact.fullName) || 'Your Name'}</h1>
      ${d.contact.jobTitle ? `<p class="job-title">${esc(d.contact.jobTitle)}</p>` : ''}
      <div class="contact-row">${contacts.join('')}</div>
      <div style="clear:both;"></div>
    </header>
    ${summary}${exp}${edu}${skills}${projects}${langCert}
  </div></body></html>`;
}

// ─── Minimal ─────────────────────────────────────────────────────────────────
function renderMinimal(d: ResumeData): string {
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.4; background: white; }
    .page { padding: 32px 40px; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
              border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
    .job-title { font-size: 12px; color: #64748b; font-weight: 300; margin-top: 2px; }
    .contact-right { text-align: right; font-size: 11px; color: #64748b; line-height: 1.7; white-space: nowrap; }
    .row-block { display: grid; grid-template-columns: 88px 1fr; gap: 16px; margin-bottom: 18px; }
    .label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
             color: #94a3b8; padding-top: 2px; }
    .content { }
    .exp-entry { margin-bottom: 14px; }
    .title-row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px; }
    .entry-title { font-size: 13px; font-weight: 600; color: #0f172a; }
    .entry-date { font-size: 11px; color: #94a3b8; white-space: nowrap; }
    .entry-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
    .dot-list { list-style: none; margin-top: 4px; }
    .dot-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #334155; margin-bottom: 3px; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; flex-shrink: 0; margin-top: 5px; }
    .body-text { font-size: 12px; color: #334155; line-height: 1.5; }
    .two-col { display: flex; gap: 24px; }
    .two-col > div { flex: 1; }
  `;

  function rowBlock(label: string, content: string) {
    return `<div class="row-block"><div class="label">${label}</div><div class="content">${content}</div></div>`;
  }

  const expContent = d.experience.length === 0 ? '' : rowBlock('Experience', d.experience.map((e) => `
    <div class="exp-entry">
      <div class="title-row">
        <span class="entry-title">${esc(e.role)}</span>
        <span class="entry-date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
      </div>
      <div class="entry-sub">${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ''}</div>
      ${e.bullets.filter(Boolean).length ? `<ul class="dot-list">${e.bullets.filter(Boolean).map((b) => `<li><span class="dot"></span><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
    </div>`).join(''));

  const eduContent = d.education.length === 0 ? '' : rowBlock('Education', d.education.map((e) => `
    <div class="exp-entry">
      <div class="title-row">
        <span class="entry-title">${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</span>
        <span class="entry-date">${esc(e.startDate)}${e.startDate && e.endDate ? ' - ' : ''}${esc(e.endDate)}</span>
      </div>
      <div class="entry-sub">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}</div>
    </div>`).join(''));

  const skills = d.skills.length === 0 ? '' : rowBlock('Skills', `<p class="body-text">${d.skills.map(esc).join('  ·  ')}</p>`);
  const summary = d.summary ? rowBlock('Profile', `<p class="body-text">${esc(d.summary)}</p>`) : '';

  const projectsContent = d.projects.length === 0 ? '' : rowBlock('Projects', d.projects.map((p) => `
    <div class="exp-entry">
      <span class="entry-title" style="font-size:12px">${esc(p.name)}</span>
      ${p.link ? `<span class="entry-sub" style="margin-left:8px;display:inline">${esc(p.link)}</span>` : ''}
      <p class="body-text">${esc(p.description)}</p>
    </div>`).join(''));

  const langCert = (d.languages.length > 0 || d.certifications.length > 0) ? `
    <div class="row-block">
      <div class="label">${d.languages.length > 0 ? 'Languages' : 'Certs'}</div>
      <div class="two-col">
        ${d.languages.length > 0 ? `<div><p class="body-text">${d.languages.map(esc).join(', ')}</p></div>` : ''}
        ${d.certifications.length > 0 ? `<div><p class="body-text">${d.certifications.map(esc).join(', ')}</p></div>` : ''}
      </div>
    </div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body><div class="page">
    <div class="header">
      <div>
        <h1>${esc(d.contact.fullName) || 'Your Name'}</h1>
        ${d.contact.jobTitle ? `<p class="job-title">${esc(d.contact.jobTitle)}</p>` : ''}
      </div>
      <div class="contact-right">
        ${d.contact.email ? `<div>${esc(d.contact.email)}</div>` : ''}
        ${d.contact.phone ? `<div>${esc(d.contact.phone)}</div>` : ''}
        ${d.contact.location ? `<div>${esc(d.contact.location)}</div>` : ''}
        ${d.contact.linkedin ? `<div>${esc(d.contact.linkedin)}</div>` : ''}
        ${d.contact.website ? `<div>${esc(d.contact.website)}</div>` : ''}
      </div>
    </div>
    ${summary}${expContent}${eduContent}${skills}${projectsContent}${langCert}
  </div></body></html>`;
}

// Environment-aware browser launch: local Chromium on Hetzner, @sparticuz/chromium
// on Vercel (with a system Chrome fallback for local dev where neither is set up).
async function getBrowser() {
  const puppeteer = (await import('puppeteer-core')).default;

  if (process.env.DEPLOY_ENV === 'hetzner') {
    // Hetzner: use local Chromium installed via apt
    const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';
    return puppeteer.launch({
      executablePath: chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--headless=new',
      ],
      headless: true,
    });
  }

  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } catch {
    // Local dev fallback: use system Chrome when @sparticuz/chromium binary unavailable
    const localChrome =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return puppeteer.launch({
      executablePath: localChrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { resumeData, template } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
    }

    const data = resumeData as ResumeData;
    const tpl = (template || 'modern') as TemplateId;

    const html =
      tpl === 'classic' ? renderClassic(data) :
      tpl === 'minimal' ? renderMinimal(data) :
      renderModern(data);

    const browser = await getBrowser();

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });

      const safeName = (data.contact?.fullName || 'resume')
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeName}-resume.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (e) {
    console.error('[resume-pdf]', e);
    const msg = e instanceof Error ? e.message : 'PDF generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
