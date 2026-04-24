import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Salary Check",
    description:
      "See real compensation ranges for your role, seniority, and city across the UAE and GCC — before you negotiate or accept an offer.",
    tag: "Know your number",
    href: "/salary",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Fit Score",
    description:
      "Paste a job description and your experience. Get an honest fit assessment so you apply where you'll actually land — not just anywhere.",
    tag: "Apply smarter",
    href: "/",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Cover Letter",
    description:
      "Generate a sharp, tailored cover letter for any Gulf role — in Arabic or English — that actually sounds like you wrote it.",
    tag: "Stand out",
    href: "/",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Subtle background pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 20%, #F5E6C8 0%, transparent 55%), radial-gradient(circle at 10% 80%, #F5E6C8 0%, transparent 45%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[var(--accent-light)] bg-[var(--accent-light)] text-[var(--accent-dark)] text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block" />
              Built for UAE & GCC job seekers
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight max-w-3xl mx-auto">
              Before you apply in the Gulf —<br />
              <span className="text-[var(--accent)]">know if you&apos;re a fit,</span>{" "}
              and know what you&apos;re worth.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              GulfFit gives you salary benchmarks, honest fit scores, and
              tailored cover letters — so every application you send is
              informed, confident, and competitive.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/salary"
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent-dark)] transition-colors shadow-sm"
              >
                Check my salary range
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 rounded-xl bg-[var(--surface)] text-[var(--foreground)] font-semibold text-base border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                Score a job fit
              </Link>
            </div>

            {/* Social proof strip */}
            <p className="mt-8 text-sm text-[var(--muted)]">
              Free to use &nbsp;·&nbsp; No account required to start &nbsp;·&nbsp; UAE, KSA, Qatar & more
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <hr className="border-[var(--border)]" />
        </div>

        {/* Feature cards */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              Three tools. One clear edge.
            </h2>
            <p className="mt-3 text-[var(--muted)] text-base md:text-lg max-w-xl mx-auto">
              Everything you need to walk into your Gulf job search with clarity and confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 flex flex-col gap-5 hover:border-[var(--accent)] hover:shadow-md transition-all duration-200"
              >
                {/* Tag */}
                <span className="self-start text-xs font-semibold tracking-wide uppercase text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">
                  {f.tag}
                </span>

                {/* Icon */}
                <div className="text-[var(--accent)]">{f.icon}</div>

                {/* Copy */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>

                {/* Arrow link */}
                <Link
                  href={f.href}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:gap-2.5 transition-all"
                >
                  Try it free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-[var(--foreground)] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                Ready to find your fit<br className="hidden md:block" /> in the Gulf?
              </h2>
              <p className="mt-3 text-white/60 text-base max-w-md">
                Join thousands of professionals making smarter career moves across the UAE and GCC.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent-dark)] transition-colors"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
