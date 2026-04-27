"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

const RICH_SHADOW =
  "0 2px 8px -1px rgba(10,22,40,0.08), 0 24px 48px -12px rgba(10,22,40,0.18), 0 48px 96px -24px rgba(10,22,40,0.12)";

export function WhyAddifyVisual() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const floatAnimate = (y: number, rotate: number) =>
    prefersReduced
      ? undefined
      : { y: [0, -y, 0], rotate: [rotate, rotate + 0.5, rotate - 0.5, rotate] };

  const floatTransition = (delay: number, y: number) =>
    prefersReduced
      ? undefined
      : ({
          duration: 5 + delay * 1.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay,
          y: { duration: 5 + delay * 1.5, repeat: Infinity, ease: "easeInOut" as const, delay },
        });

  const riseVariant = (i: number) => ({
    initial: { opacity: 0, y: 32 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  });

  return (
    <div ref={ref} className="relative h-[420px] md:h-[520px] w-full" aria-hidden>
      {/* Ambient glow — two slow-drifting radials */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        animate={prefersReduced ? {} : { x: [0, 12, 0], y: [0, -8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)",
          filter: "blur(24px)",
        }}
      />
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        animate={prefersReduced ? {} : { x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          background:
            "radial-gradient(circle at 75% 65%, rgba(16,185,129,0.06) 0%, transparent 50%)",
          filter: "blur(24px)",
        }}
      />

      {/* Card 1: Salary result — top-left */}
      <motion.div {...riseVariant(0)}>
        <motion.div
          className="absolute top-0 left-4 w-56 rounded-xl border border-border shadow-hover p-4 backdrop-blur-xl bg-gradient-to-br from-card via-card to-accent/5 hover:border-accent/30 hover:-translate-y-2 transition-all duration-300 group"
          style={{ rotate: "-6deg", boxShadow: RICH_SHADOW }}
          animate={floatAnimate(8, -6)}
          transition={floatTransition(0, 8)}
        >
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <span className="text-base">🇦🇪</span> Dubai
          </div>
          <p className="mt-2 text-xs uppercase tracking-wider text-accent font-semibold">Senior Developer</p>
          <p className="mt-1 font-display text-2xl text-foreground">AED 22,000</p>
          <p className="text-xs text-foreground/60">to AED 32,000 per month</p>
          <div className="mt-3 h-1 w-full rounded-full bg-border overflow-hidden">
            <div className="h-1 w-3/5 rounded-full bg-accent/60" />
          </div>
          {/* Pulsing "updated" dot */}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-foreground/50">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Updated just now
          </div>
        </motion.div>
      </motion.div>

      {/* Card 2: Fit score — top-right */}
      <motion.div {...riseVariant(1)}>
        <motion.div
          className="absolute top-12 right-0 w-48 rounded-xl border border-border p-4 backdrop-blur-xl bg-gradient-to-br from-card via-card to-accent/5 hover:border-accent/30 hover:-translate-y-2 transition-all duration-300"
          style={{ rotate: "5deg", boxShadow: RICH_SHADOW }}
          animate={floatAnimate(10, 5)}
          transition={floatTransition(0.5, 10)}
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
              {/* Shimmer overlay on the score number */}
              <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor" className="text-foreground">78</text>
            </svg>
            <div>
              <p className="font-display text-xl text-foreground">78</p>
              <p className="text-xs text-foreground/60">Fit Score</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-success font-medium">Strong skill match</p>
        </motion.div>
      </motion.div>

      {/* Card 3: Cover letter — bottom-left */}
      <motion.div {...riseVariant(2)}>
        <motion.div
          className="absolute bottom-8 left-0 w-52 rounded-xl border border-border p-4 backdrop-blur-xl bg-gradient-to-br from-card via-card to-accent/5 hover:border-accent/30 hover:-translate-y-2 transition-all duration-300"
          style={{ rotate: "4deg", boxShadow: RICH_SHADOW }}
          animate={floatAnimate(6, 4)}
          transition={floatTransition(1, 6)}
        >
          <p className="text-xs uppercase tracking-wider text-accent font-semibold">Cover Letter</p>
          <p className="mt-2 text-xs text-foreground/80 leading-relaxed line-clamp-3">
            Dear Hiring Manager, I am writing to apply for the Product Manager role at...
          </p>
          {/* Typing cursor blink */}
          <span className="inline-block w-px h-3 bg-foreground/50 ml-0.5 align-middle animate-pulse" />
          <div className="mt-3 flex items-center gap-1">
            <div className="h-1.5 w-12 rounded-full bg-accent/40" />
            <div className="h-1.5 w-8 rounded-full bg-accent/30" />
            <div className="h-1.5 w-16 rounded-full bg-accent/20" />
          </div>
        </motion.div>
      </motion.div>

      {/* Card 4: Job listing — bottom-right */}
      <motion.div {...riseVariant(3)}>
        <motion.div
          className="absolute bottom-0 right-8 w-56 rounded-xl border border-border p-4 backdrop-blur-xl bg-gradient-to-br from-card via-card to-accent/5 hover:border-accent/30 hover:-translate-y-2 transition-all duration-300"
          style={{ rotate: "-4deg", boxShadow: RICH_SHADOW }}
          animate={floatAnimate(9, -4)}
          transition={floatTransition(1.5, 9)}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Marketing Manager</p>
              <p className="text-xs text-foreground/60">DXB Group · Riyadh</p>
            </div>
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
              Featured
            </span>
          </div>
          <p className="mt-3 text-xs text-foreground/80">SAR 18,000 to 25,000</p>
          <p className="mt-1 text-xs text-success font-medium">Match: 82%</p>
          {/* Green "hiring now" dot */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Hiring now
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
