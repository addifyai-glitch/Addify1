"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toolsLinks = [
  { label: "Salary Check", href: "/salary", desc: "See what your role pays across the Gulf" },
  { label: "Fit Score", href: "/fit", desc: "Score any job offer before you apply" },
  { label: "Cover Letter", href: "/cover-letter", desc: "AI-written, tailored to the role" },
  { label: "Resume Builder", href: "/tools/resume-builder", desc: "Gulf-ready resume in minutes" },
];

const standaloneLinks = [
  { label: "Jobs", href: "/jobs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const allMobileLinks = [
  ...toolsLinks,
  ...standaloneLinks,
];

function NavDropdown({
  label,
  links,
  activeHrefs,
}: {
  label: string;
  links: { label: string; href: string; desc: string }[];
  activeHrefs: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = activeHrefs.some((h) => pathname.startsWith(h));

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-md transition-colors duration-200",
          isActive
            ? "text-accent font-semibold"
            : "text-foreground/80 hover:text-accent hover:bg-accent/5"
        )}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-3 w-64 rounded-2xl border border-border bg-card shadow-lg p-2 z-50"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors",
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span className="text-sm font-medium">{link.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">{link.desc}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "w-full sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "backdrop-blur-md bg-background/80 border-b border-border/50 shadow-soft"
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="font-display text-2xl text-foreground tracking-tight">
              Addify
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent mb-1 ml-0.5" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                "text-[15px] font-medium px-3 py-2 rounded-md transition-colors duration-200",
                pathname === "/"
                  ? "text-accent font-semibold"
                  : "text-foreground/80 hover:text-accent hover:bg-accent/5"
              )}
            >
              Home
            </Link>
            <NavDropdown
              label="Tools"
              links={toolsLinks}
              activeHrefs={["/salary", "/fit", "/cover-letter", "/tools"]}
            />
            {standaloneLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[15px] font-medium px-3 py-2 rounded-md transition-colors duration-200",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-accent font-semibold"
                    : "text-foreground/80 hover:text-accent hover:bg-accent/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/salary">
              <Button size="sm" variant="primary">Get Started</Button>
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background flex flex-col pt-24 pb-10 px-8 md:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-4 flex-1">
              <Link
                href="/"
                className={cn(
                  "text-xl font-semibold transition-colors",
                  pathname === "/" ? "text-accent" : "text-foreground hover:text-accent"
                )}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              {allMobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xl font-semibold transition-colors",
                    pathname === link.href ? "text-accent" : "text-foreground hover:text-accent"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <Link href="/salary" onClick={() => setMenuOpen(false)}>
                <Button size="lg" variant="primary" className="w-full justify-center">
                  Get Started, it&apos;s free
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                No signup required · No credit card ever
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
