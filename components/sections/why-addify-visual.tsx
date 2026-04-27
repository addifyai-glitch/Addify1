"use client";

import { motion, useReducedMotion } from "framer-motion";

export function WhyAddifyVisual() {
  const prefersReduced = useReducedMotion();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const floatProps = (delay: number, yRange: number): Record<string, any> =>
    prefersReduced
      ? {}
      : {
          animate: { y: [0, -yRange, 0] },
          transition: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay },
        };

  return (
    <div className="relative h-[400px] md:h-[500px] w-full" aria-hidden>
      {/* Background glow */}
      <div
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Card 1: Salary result, top-left */}
      <motion.div
        className="absolute top-0 left-4 w-56 rounded-xl bg-card border border-border shadow-hover p-4"
        style={{ rotate: "-6deg" }}
        {...floatProps(0, 8)}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-base">🇦🇪</span> Dubai
        </div>
        <p className="mt-2 text-xs uppercase tracking-wider text-accent font-semibold">Senior Developer</p>
        <p className="mt-1 font-display text-2xl text-foreground">AED 22,000</p>
        <p className="text-xs text-muted-foreground">to AED 32,000 per month</p>
        <div className="mt-3 h-1 w-full rounded-full bg-border overflow-hidden">
          <div className="h-1 w-3/5 rounded-full bg-accent/60" />
        </div>
      </motion.div>

      {/* Card 2: Fit score, top-right */}
      <motion.div
        className="absolute top-12 right-0 w-48 rounded-xl bg-card border border-border shadow-hover p-4"
        style={{ rotate: "5deg" }}
        {...floatProps(0.5, 10)}
      >
        <div className="flex items-center gap-3">
          <svg width="52" height="52" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="28" cy="28" r="24"
              fill="none" stroke="currentColor" strokeWidth="4"
              className="text-accent"
              strokeDasharray={`${(78 / 100) * 150.8} 150.8`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
            />
            <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor" className="text-foreground">78</text>
          </svg>
          <div>
            <p className="font-display text-xl text-foreground">78</p>
            <p className="text-xs text-muted-foreground">Fit Score</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-success font-medium">Strong skill match</p>
      </motion.div>

      {/* Card 3: Cover letter snippet, bottom-left */}
      <motion.div
        className="absolute bottom-8 left-0 w-52 rounded-xl bg-card border border-border shadow-hover p-4"
        style={{ rotate: "4deg" }}
        {...floatProps(1, 6)}
      >
        <p className="text-xs uppercase tracking-wider text-accent font-semibold">Cover Letter</p>
        <p className="mt-2 text-xs text-foreground/80 leading-relaxed line-clamp-4">
          Dear Hiring Manager, I am writing to apply for the Product Manager role at...
        </p>
        <div className="mt-3 flex items-center gap-1">
          <div className="h-1.5 w-12 rounded-full bg-accent/40" />
          <div className="h-1.5 w-8 rounded-full bg-accent/30" />
          <div className="h-1.5 w-16 rounded-full bg-accent/20" />
        </div>
      </motion.div>

      {/* Card 4: Job listing, bottom-right */}
      <motion.div
        className="absolute bottom-0 right-8 w-56 rounded-xl bg-card border border-border shadow-hover p-4"
        style={{ rotate: "-4deg" }}
        {...floatProps(1.5, 9)}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Marketing Manager</p>
            <p className="text-xs text-muted-foreground">DXB Group · Riyadh</p>
          </div>
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
            Featured
          </span>
        </div>
        <p className="mt-3 text-xs text-foreground/80">SAR 18,000 to 25,000</p>
        <p className="mt-1 text-xs text-success font-medium">Match: 82%</p>
      </motion.div>
    </div>
  );
}
