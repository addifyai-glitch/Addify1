import { ResumeData, TemplateId } from '@/types/resume';
import { ModernTemplate } from './ModernTemplate';

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimal', name: 'Minimal' },
];

export function RenderTemplate({ id, data }: { id: TemplateId; data: ResumeData }) {
  switch (id) {
    default: return <ModernTemplate data={data} />;
  }
}
