import { ResumeData, TemplateId } from '@/types/resume';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalTemplate } from './MinimalTemplate';

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimal', name: 'Minimal' },
];

export function RenderTemplate({ id, data }: { id: TemplateId; data: ResumeData }) {
  switch (id) {
    case 'classic': return <ClassicTemplate data={data} />;
    case 'minimal': return <MinimalTemplate data={data} />;
    default:        return <ModernTemplate data={data} />;
  }
}
