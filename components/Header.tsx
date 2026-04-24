"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[var(--card)] border-b border-[var(--card-border)] sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Gulf<span className="text-[var(--accent)]">Fit</span>
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-dark)]">
            UAE & GCC
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
          <Link
            href="/salary"
            className="hover:text-[var(--foreground)] transition-colors duration-150"
          >
            Salary Check
          </Link>
          <Link
            href="/"
            className="hover:text-[var(--foreground)] transition-colors duration-150"
          >
            Fit Score
          </Link>
          <Link
            href="/"
            className="hover:text-[var(--foreground)] transition-colors duration-150"
          >
            Cover Letter
          </Link>
        </nav>

        {/* Right: toggle + auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-dark)] transition-colors duration-150"
          >
            Get started
          </Link>
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--card)] px-6 py-5 flex flex-col gap-4 text-sm font-medium">
          <Link href="/salary" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Salary Check
          </Link>
          <Link href="/" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Fit Score
          </Link>
          <Link href="/" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Cover Letter
          </Link>
          <hr className="border-[var(--card-border)]" />
          <Link href="/" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Sign in
          </Link>
          <Link
            href="/"
            className="text-center font-semibold px-4 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-dark)] transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
