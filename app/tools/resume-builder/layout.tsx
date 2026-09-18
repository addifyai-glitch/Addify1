import type { Metadata } from 'next';
import { buildBreadcrumbLd } from '@/lib/breadcrumb-schema';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Free Resume Builder',
  description: 'Build a professional resume in minutes. 3 templates, live preview, AI summary helper, browser PDF export. Free, anonymous, no account needed.',
  alternates: { canonical: '/tools/resume-builder' },
  openGraph: {
    type: 'website',
    siteName: 'Addify.ae',
    locale: 'en_AE',
    title: 'Free Resume Builder — Addify',
    description: 'Build a professional resume in minutes. 3 templates, AI summary helper, instant PDF. Free, no signup.',
    url: 'https://addify.ae/tools/resume-builder',
    images: [{ url: '/api/og/resume?title=Build+Your+Resume+Free', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Resume Builder — Addify',
    description: 'Build a professional resume in minutes. 3 templates, AI summary helper, instant PDF. Free, no signup.',
    images: ['/api/og/resume?title=Build+Your+Resume+Free'],
  },
};

const softwareApplicationLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Addify Resume Builder',
  url: 'https://addify.ae/tools/resume-builder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  description:
    'A free resume builder with 3 ATS-ready templates, live preview, an AI summary helper, and one-click PDF export. No account needed.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
  publisher: { '@type': 'Organization', name: 'Addify', url: 'https://addify.ae' },
};

const breadcrumbLd = buildBreadcrumbLd([
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/tools' },
  { name: 'Resume Builder', url: '/tools/resume-builder' },
]);

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[softwareApplicationLd, breadcrumbLd]} />
      {children}
    </>
  );
}
