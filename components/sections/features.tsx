"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Target, FileText, Check, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

const tools = [
  {
    Icon: DollarSign,
    name: "Salary Check",
    href: "/salary",
    description:
      "See real compensation ranges for your exact role, seniority, and city across the UAE and the wider GCC. Know the number before you negotiate.",
    bullets: [
      "34 cities across 6 GCC countries + Egypt",
      "120+ job titles from intern to C-suite",
      "Housing, transport & total package breakdown",
    ],
  },
  {
    Icon: Target,
    name: "Fit Score",
    href: "/fit",
    description:
      "Paste a job description and your experience. Get an honest fit score from 0 to 100 with clear reasons so you apply where you'll actually land.",
    bullets: [
      "AI-powered skill gap analysis",
      "Tailored to Gulf hiring standards",
      "Know your chances before you apply",
    ],
  },
  {
    Icon: FileText,
    name: "Cover Letter",
    href: "/cover-letter",
    description:
      "Generate a tailored cover letter for any Gulf role in Arabic or English. It reads like you wrote it, not a template.",
    bullets: [
      "Arabic & English language support",
      "Customized per job description",
      "Ready in under 60 seconds",
    ],
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 flex items-center justify-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            The tools
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            Three tools. One clear edge.
          </h2>
          <p className="mt-3 text-base md:text-lg text-foreground/80 max-w-xl mx-auto">
            Everything you need to walk into your Gulf job search with clarity and confidence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              className="group relative bg-card border border-border rounded-xl shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col p-8"
            >
              {/* Icon badge */}
              <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <tool.Icon size={20} className="text-accent-foreground" />
              </div>

              {/* Name */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {tool.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                {tool.description}
              </p>

              {/* Bullets */}
              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {tool.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={15}
                      className="text-success shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Link */}
              <Link
                href={tool.href}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent group/link hover:gap-2.5 transition-all duration-200"
              >
                Try it free
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover/link:translate-x-1"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
