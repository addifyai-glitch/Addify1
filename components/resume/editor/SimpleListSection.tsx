'use client';

import { TagInput } from './SkillsSection';

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function SimpleListSection({ items, onChange, placeholder }: Props) {
  return (
    <div>
      <TagInput items={items} onChange={onChange} placeholder={placeholder ?? 'Type and press Enter...'} />
      <p className="text-xs text-muted-foreground mt-1.5">Press Enter or comma to add each item.</p>
    </div>
  );
}
