"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a fixed-size placeholder before hydration to prevent layout shift
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="w-9 h-9 rounded-full border border-[var(--card-border)]"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative w-9 h-9 flex items-center justify-center
        rounded-full border border-[var(--card-border)] bg-[var(--card)]
        text-[var(--muted-foreground)] hover:text-[var(--foreground)]
        hover:border-[var(--accent)]
        transition-colors duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Sun size={15} strokeWidth={2} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Moon size={15} strokeWidth={2} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
