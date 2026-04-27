"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { WhyAddifyVisual } from "./why-addify-visual";

const values = [
  "Built for Gulf realities: housing allowance, visa status, and nationality nuances",
  "Your data stays private. Never shared with employers or recruiters",
  "Real submissions, not scraped LinkedIn averages",
  "One platform for every career stage, from first job to C-suite",
];

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-accent" />
              Why Addify
              <span className="inline-block h-1 w-1 rounded-full bg-accent" />
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
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {v}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: floating product cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <WhyAddifyVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
