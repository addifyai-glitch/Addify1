"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, FileCheck2 } from "lucide-react";
import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "01",
    Icon: Search,
    title: "Pick your role",
    description:
      "Choose from 120+ global job titles across 14 categories, from interns to C-suite.",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "Get your numbers",
    description:
      "Instant benchmarks across 34 cities in the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, and Egypt.",
  },
  {
    number: "03",
    Icon: FileCheck2,
    title: "Know your fit",
    description:
      "Upload your resume, paste any job description, and we score your fit from 0 to 100 with reasons.",
  },
];


export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <Container>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            Three steps to clarity
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative bg-card border border-border rounded-xl p-8 shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Serif number */}
              <span className="font-display text-6xl text-muted-foreground/20 absolute top-4 left-6 leading-none select-none">
                {step.number}
              </span>

              {/* Icon */}
              <div className="relative z-10 mb-5 mt-8 w-11 h-11 flex items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-105 transition-transform duration-300">
                <step.Icon size={22} />
              </div>

              {/* Content */}
              <h3 className="relative z-10 text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="relative z-10 text-sm text-foreground/80 leading-relaxed">
                {step.description}
              </p>

              {/* Bottom accent glow */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
