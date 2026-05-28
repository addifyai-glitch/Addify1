'use client';

import { useState, KeyboardEvent } from 'react';

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function TagInput({ items, onChange, placeholder = 'Type and press Enter...' }: Props) {
  const [input, setInput] = useState('');

  function add() {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput('');
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
    if (e.key === 'Backspace' && !input && items.length > 0) {
      onChange(items.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          {item}
          <button type="button" onClick={() => onChange(items.filter((i) => i !== item))} className="hover:opacity-60 transition-opacity ml-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={items.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function SkillsSection({ items, onChange }: Props) {
  return (
    <div>
      <TagInput items={items} onChange={onChange} placeholder="e.g. Google Analytics — press Enter to add" />
      <p className="text-xs text-muted-foreground mt-1.5">Type a skill and press Enter. Use comma to separate multiple.</p>
    </div>
  );
}
