"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";

// Static display strings, not animated counters: a count-up-from-zero
// effect can only start from 0 on the client after hydration, which meant
// the real values never existed in SSR HTML at all (crawlers and
// pre-hydration first paint both saw "0 Gulf cities", "0+ Global job
// titles", "0s Avg. time"). The real numbers now render immediately,
// server-side; only the surrounding card still animates in (opacity/y).
const stats = [
  { value: "34", label: "Gulf cities covered" },
  { value: "120+", label: "Global job titles" },
  { value: "60s", label: "Avg. time to result" },
  { value: "Free", label: "Core tools, always" },
];

export function Stats() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center gap-2 group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <span className="font-display text-5xl md:text-6xl text-primary-foreground tabular-nums transition-all duration-300 group-hover:text-accent group-hover:[text-shadow:_0_0_30px_rgb(245_158_11_/_0.3)]">
                {stat.value}
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
