import { parseJobDescription } from "@/lib/cover-letter/parse-jd";

// Shows how a pasted or fetched job ad was read. If the parse isn't provably
// lossless, the original text is shown untouched instead of a mangled version.
export function JobAdPreview({ text }: { text: string }) {
  const parsed = parseJobDescription(text);
  if (!parsed.ok && parsed.reason === "empty") return null;

  return (
    <div className="mt-4 rounded-xl border border-border bg-background p-4 max-h-80 overflow-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-3">
        {parsed.ok ? "How we read this ad" : "Original text"}
      </p>

      {parsed.ok ? (
        <div className="space-y-3 text-sm text-foreground">
          {parsed.blocks.map((b, i) => {
            if (b.type === "heading") {
              return (
                <h3 key={i} className="font-semibold text-foreground pt-1">
                  {b.text}
                </h3>
              );
            }
            if (b.type === "paragraph") return <p key={i}>{b.text}</p>;
            const List = b.ordered ? "ol" : "ul";
            return (
              <List
                key={i}
                className={`${b.ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1`}
              >
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </List>
            );
          })}
        </div>
      ) : (
        <>
          <p className="text-xs text-foreground/80 mb-2">
            We couldn&apos;t split this into sections, so here&apos;s exactly what you pasted.
          </p>
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-foreground">
            {parsed.raw}
          </pre>
        </>
      )}
    </div>
  );
}
