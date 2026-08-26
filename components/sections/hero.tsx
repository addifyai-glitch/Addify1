"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { Grain } from "@/components/ui/grain";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────────────────

const countries = ["UAE", "KSA", "QATAR", "OMAN", "BAHRAIN", "KUWAIT", "EGYPT"];

const demoRoles = [
  { title: "Finance Manager", city: "Dubai", flag: "🇦🇪", salary: "AED 33,000 to 55,000", period: "per month" },
  { title: "Senior Software Engineer", city: "Riyadh", flag: "🇸🇦", salary: "SAR 22,000 to 35,000", period: "per month" },
  { title: "Marketing Manager", city: "Doha", flag: "🇶🇦", salary: "QAR 22,000 to 35,000", period: "per month" },
  { title: "Registered Nurse", city: "Abu Dhabi", flag: "🇦🇪", salary: "AED 12,000 to 18,000", period: "per month" },
  { title: "Managing Director", city: "Kuwait City", flag: "🇰🇼", salary: "KWD 4,500 to 7,000", period: "per month" },
  { title: "Data Scientist", city: "Cairo", flag: "🇪🇬", salary: "EGP 45,000 to 80,000", period: "per month" },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function TypedText({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    setCount(0);
    const perChar = Math.max(18, 600 / text.length);
    const timer = setInterval(() => {
      setCount((p) => Math.min(p + 1, text.length));
    }, perChar);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <>
      {text.slice(0, count)}
      {!done && (
        <span className="inline-block w-px h-5 bg-foreground/50 ml-0.5 align-middle animate-pulse" />
      )}
    </>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

export function Hero() {
  const prefersReduced = useReducedMotion();
  const [activeDemo, setActiveDemo] = useState(0);
  const [showUnderline, setShowUnderline] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-80, 80], [4, -4]);
  const rotateY = useTransform(mx, [-80, 80], [-4, 4]);

  // Cycle demo cards every 3.5 s
  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => {
      setActiveDemo((p) => (p + 1) % demoRoles.length);
    }, 3500);
    return () => clearInterval(id);
  }, [prefersReduced]);

  // Trigger underline after headline words animate in
  useEffect(() => {
    const headlineWords = ["Your", "Gulf", "career", "co-pilot."];
    const delay = headlineWords.length * 120 + 600 + 300;
    const id = setTimeout(() => setShowUnderline(true), delay);
    return () => clearTimeout(id);
  }, []);

  function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleCardMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  const headlineWords = ["Your", "Gulf", "career", "co-pilot."];

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
      <MeshGradient variant="hero" />
      <Grain />

      <Container className="relative z-10">
        {/* Eyebrow */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-8">
          {countries.map((c, i) => (
            <motion.span
              key={c}
              className="text-xs font-semibold tracking-[0.25em] text-accent uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReduced ? 0 : i * 0.08,
                duration: 0.4,
              }}
            >
              {c}
              {i < countries.length - 1 && (
                <span className="ml-3 opacity-30">•</span>
              )}
            </motion.span>
          ))}
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-center max-w-4xl mx-auto">
          {headlineWords.map((word, i) => {
            const isGulf = word === "Gulf";
            const isPilot = word === "co-pilot.";
            return (
              <Fragment key={i}>
              <motion.span
                className={`inline-block ${isGulf ? "text-accent" : ""} ${isPilot ? "relative" : ""}`}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReduced ? 0 : 0.4 + i * 0.12, duration: 0.5 }}
              >
                {word}
                {isPilot && showUnderline && !prefersReduced && (
                  <svg
                    className="absolute -bottom-2 left-0 w-full overflow-visible"
                    height="10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <motion.path
                      d="M0 7 C25 3, 75 3, 100 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      className="text-accent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </svg>
                )}
              </motion.span>
              {" "}
              </Fragment>
            );
          })}
        </h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-foreground/85 max-w-2xl mx-auto text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReduced ? 0 : 1.6, duration: 0.6 }}
        >
          The only career platform built for the Gulf. Check what you should earn
          in 34 cities, build a Gulf-ready resume, and get a tailored cover letter
          in under 60 seconds.
        </motion.p>

        {/* CTA group */}
        <motion.div
          className="mt-10 flex flex-col md:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 1.9, duration: 0.5 }}
        >
          <Link href="/salary" className="group">
            <Button size="lg" variant="primary" className="group">
              Check Your Salary
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Button>
          </Link>
          <Link href="/tools/resume-builder">
            <Button size="lg" variant="secondary">Build Your Resume</Button>
          </Link>
          <Link href="/cover-letter">
            <Button size="lg" variant="secondary">Write a Cover Letter</Button>
          </Link>
          <Link href="/tools/gratuity-calculator">
            <Button size="lg" variant="secondary">Calculate Your Gratuity</Button>
          </Link>
        </motion.div>

        {/* Live demo card */}
        <motion.div
          className="mt-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 2.1, duration: 0.6 }}
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={
              prefersReduced
                ? {}
                : { perspective: 1000, rotateX, rotateY, transformStyle: "preserve-3d" }
            }
            className="backdrop-blur-xl bg-card/70 border border-border/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_2px_8px_-1px_rgba(10,22,40,0.08),0_16px_40px_-8px_rgba(10,22,40,0.12),0_32px_80px_-16px_rgba(10,22,40,0.08)]"
          >
            {/* Rotating sparkle */}
            <motion.div
              className="absolute top-4 right-4 text-accent/60"
              animate={prefersReduced ? {} : { rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={18} />
            </motion.div>

            {/* Subtle gradient inside card */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 60%)",
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReduced ? 0 : -10 }}
                transition={{ duration: 0.35 }}
                className="relative z-10"
              >
                {/* City pill */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-muted text-muted-foreground rounded-full px-3 py-1 mb-4">
                  <span>{demoRoles[activeDemo].flag}</span>
                  {demoRoles[activeDemo].city}
                </span>

                {/* Role title — typed effect */}
                <p className="text-xl font-semibold text-foreground mb-1 min-h-[1.75rem]">
                  <TypedText text={demoRoles[activeDemo].title} />
                </p>

                {/* Salary — flicker into place */}
                <motion.p
                  key={`salary-${activeDemo}`}
                  className="font-display text-3xl md:text-4xl text-accent tabular-nums"
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  {demoRoles[activeDemo].salary}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-1">
                  {demoRoles[activeDemo].period}
                </p>

                {/* Meta */}
                <p className="mt-4 text-xs text-muted-foreground/60">
                  Updated 2026 · Gulf market reports
                </p>

                {/* Progress dots */}
                <div className="flex gap-1.5 mt-5">
                  {demoRoles.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === activeDemo
                          ? "w-6 bg-accent"
                          : "w-1.5 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Country coverage strip */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReduced ? 0 : 2.5, duration: 0.6 }}
        >
          <p className="text-sm text-foreground/60">Salary data across 7 countries</p>
          <div className="flex items-center gap-6 md:gap-8 flex-wrap justify-center">
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇦🇪</span> UAE
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇸🇦</span> Saudi Arabia
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇶🇦</span> Qatar
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇰🇼</span> Kuwait
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇧🇭</span> Bahrain
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇴🇲</span> Oman
            </span>
            <span className="flex items-center gap-2 text-foreground/70 text-sm">
              <span className="text-2xl">🇪🇬</span> Egypt
            </span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
