import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold tracking-tight">
              Gulf<span className="text-[var(--accent)]">Fit</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Know your worth. Know your fit.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">About</Link>
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Salary Check</Link>
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Fit Score</Link>
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Cover Letter</Link>
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} GulfFit. All rights reserved.</p>
          <p>Built for UAE & GCC job seekers</p>
        </div>
      </div>
    </footer>
  );
}
