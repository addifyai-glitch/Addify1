import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Resume Builder | Addify',
  description: 'Build a professional resume in minutes. 3 templates, live preview, AI summary helper, browser PDF export. Free, anonymous, no account needed.',
  alternates: { canonical: '/tools/resume' },
  openGraph: {
    title: 'Free Resume Builder — Addify',
    description: 'Build a professional resume in minutes. 3 templates, AI summary helper, instant PDF. Free, no signup.',
    url: 'https://addify.ae/tools/resume',
    images: [{ url: '/api/og/resume?title=Build+Your+Resume+Free', width: 1200, height: 630 }],
  },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
