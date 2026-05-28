'use client';

interface Props {
  summary: string;
  onChange: (summary: string) => void;
  jobTitle?: string;
  onImproveWithAI?: () => void;
  aiLoading?: boolean;
  aiError?: string | null;
  aiSuggestion?: string | null;
  onAcceptAI?: () => void;
  onDismissAI?: () => void;
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none';

export function SummarySection({
  summary, onChange, onImproveWithAI, aiLoading, aiError, aiSuggestion, onAcceptAI, onDismissAI,
}: Props) {
  return (
    <div className="space-y-3">
      <textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Marketing leader with 8 years of experience driving growth across the GCC..."
        className={inputCls}
      />
      {onImproveWithAI && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onImproveWithAI}
            disabled={aiLoading || summary.trim().length < 20}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {aiLoading ? 'Improving...' : 'Improve with AI'}
          </button>
          {summary.trim().length < 20 && summary.trim().length > 0 && (
            <p className="text-xs text-muted-foreground">Write at least 20 characters first.</p>
          )}
          {aiError && <p className="text-xs text-destructive">{aiError}</p>}
          {aiSuggestion && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">AI suggestion</p>
              <p className="text-sm text-foreground leading-relaxed">{aiSuggestion}</p>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onAcceptAI} className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                  Use this
                </button>
                <button type="button" onClick={onDismissAI} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                  Keep mine
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
