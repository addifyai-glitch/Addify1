// A 40-60 word, self-contained direct answer rendered immediately after the
// H1 or first H2 of a page. This is a server component — no "use client" —
// so the answer is present in the initial HTML payload for crawlers that
// don't execute JavaScript (most AI answer engines). Visually distinct from
// body copy (accent-tinted panel) but not styled as a pull-quote, so it
// reads as the page's own opening answer, not a callout aside.
export function AnswerCapsule({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
      <p className="text-base leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}
