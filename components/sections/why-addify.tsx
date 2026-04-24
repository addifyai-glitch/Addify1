"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";

const values = [
  "Built for Gulf realities — housing allowance, visa status, nationality nuances",
  "Your data stays private — never shared with employers or recruiters",
  "Real submissions, not scraped LinkedIn averages",
  "From first job to C-suite — one platform for every career stage",
];

function AbstractOrbs() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto" aria-hidden>
      {/* Navy / slate orb */}
      <motion.div
        className="absolute top-0 left-0 w-52 h-52 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(10,22,40,0.18) 0%, rgba(10,22,40,0.04) 70%)",
          border: "1px solid rgba(10,22,40,0.12)",
        }}
        animate={
          prefersReduced
            ? {}
            : { x: [0, 12, -6, 0], y: [0, -10, 14, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Amber orb */}
      <motion.div
        className="absolute top-12 left-20 w-44 h-44 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.04) 70%)",
          border: "1px solid rgba(245,158,11,0.25)",
        }}
        animate={
          prefersReduced
            ? {}
            : { x: [0, -14, 8, 0], y: [0, 12, -8, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Emerald orb */}
      <motion.div
        className="absolute bottom-0 right-0 w-48 h-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 70%)",
          border: "1px solid rgba(16,185,129,0.18)",
        }}
        animate={
          prefersReduced
            ? {}
            : { x: [0, 10, -12, 0], y: [0, -14, 10, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-accent opacity-60" />
      </div>
    </div>
  );
}

export function WhyAddify() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: value props */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Why Addify
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8">
              Built different, for the Gulf.
            </h2>
            <ul className="flex flex-col gap-5">
              {values.map((v, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                    <Check size={12} className="text-success" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {v}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: abstract SVG composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <AbstractOrbs />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
