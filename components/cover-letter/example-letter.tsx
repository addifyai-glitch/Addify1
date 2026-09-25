// A fixed sample of the kind of letter the cover-letter tool is being built to
// write. Every name below is fictional, and nothing in this file is
// interpolated from user input: it must never read as the visitor's own result.
// No copy, download, regenerate or edit actions belong here, and neither does
// the "Generated with Addify" attribution (that line is for real output only).

const EXAMPLE_PARAGRAPHS = [
  "Dear Ms. Salem,",
  "Your posting says the Procurement Analyst owns supplier pricing across three Gulf markets. That's the work I've done for the last five years at Falcon Bay Trading in Sharjah, where I manage pricing for 140 suppliers across the UAE and Oman.",
  "Last year I replaced our quarterly supplier review, a 40-tab spreadsheet, with a single dashboard the category managers could read in ten minutes. It showed three contracts where we were paying 8 to 12 percent above the regional average. Renegotiating them saved AED 1.9 million over the year. I did it without adding headcount: routine price checks moved to a weekly script, and the time that freed up went into the supplier calls that actually change a price.",
  "Two things in your posting stood out. You're moving suppliers from AED to USD invoicing, and I handled that switch for our Omani vendors in 2023, including the hedging conversation with finance. You also want someone who works well in a small team. I was the only analyst on a five-person procurement desk, so I'm used to explaining my numbers to people who need to act on them by Friday.",
  "I'd like to talk about how I can help Crestline Foods keep its pricing steady as it grows. My CV is attached, and I'm free any weekday after 4 pm Gulf time.",
  "Kind regards,\nOmar Nasser",
];

export function ExampleLetter() {
  return (
    <section
      aria-labelledby="example-letter-heading"
      className="mt-12 rounded-2xl border border-dashed border-accent/50 bg-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border bg-accent/10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
          Example output
        </p>
        <h2 id="example-letter-heading" className="text-base font-semibold text-foreground mt-1">
          A sample of what the tool will write
        </h2>
        <p className="text-sm text-foreground/80 mt-1">
          The candidate and company below are made up. This isn&apos;t a letter for your resume or your
          job.
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-4 text-base leading-relaxed text-foreground">
        {EXAMPLE_PARAGRAPHS.map((p) => (
          <p key={p} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
