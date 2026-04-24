"use client";

export function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); console.log("Newsletter subscribe — TODO: wire to backend"); }}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        className="shrink-0 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
      >
        Subscribe
      </button>
    </form>
  );
}
