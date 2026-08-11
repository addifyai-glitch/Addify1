"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Tools", href: "/tools" },
  { label: "Jobs", href: "/jobs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

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
            {navLinks.map((link) => (
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
              {navLinks.map((link) => (
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
