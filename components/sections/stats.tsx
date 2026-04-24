"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/container";

const stats = [
  { value: 34, suffix: "", label: "Gulf cities covered" },
  { value: 120, suffix: "+", label: "Global job titles" },
  { value: 60, suffix: "s", label: "Avg. time to result" },
  { value: 0, suffix: "", label: "Cost. Core tools, always free.", isZero: true },
];

function StatNumber({
  value,
  suffix,
  isZero,
}: {
  value: number;
  suffix: string;
  isZero?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || isZero) return;
    const start = performance.now();
    const duration = 1200;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, value, isZero]);

  if (isZero) {
    return (
      <span ref={ref} className="font-display text-5xl md:text-6xl text-primary-foreground">
        Free
      </span>
    );
  }

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl text-primary-foreground tabular-nums">
      {inView ? display : 0}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <StatNumber
                value={stat.value}
                suffix={stat.suffix}
                isZero={stat.isZero}
              />
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
