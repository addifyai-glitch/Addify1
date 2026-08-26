export interface DiscriminatoryMatch {
  field: string;
  label: string;
  matchedText: string;
  context: string;
}

export const DISCRIMINATORY_PATTERNS: Array<{ label: string; pattern: RegExp }>;
export const CHECKED_FIELDS: string[];

export function checkJobForDiscriminatoryLanguage(
  job: Record<string, unknown>
): DiscriminatoryMatch[];

export function warnIfDiscriminatoryLanguage(
  job: Record<string, unknown>,
  sourceLabel?: string
): DiscriminatoryMatch[];
