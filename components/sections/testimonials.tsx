"use client";

import { useState } from "react";
import { Star, MessageCircle, Share2, X, Link2, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/data/testimonials";
import { Container } from "@/components/ui/container";

const SHARE_URL = "https://addify.ae";
const SHARE_TEXT = "Check what you should earn in the Gulf, free — Addify: Gulf Careers, Clarified.";

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="text-accent fill-accent" />
      ))}
    </div>
  );
}

function TestimonialCard({ t, i }: { t: (typeof TESTIMONIALS)[0]; i: number }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-xl shadow-soft p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
    >
      <StarRow count={t.stars} />
      <p className="text-sm md:text-base text-foreground leading-relaxed flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-1 border-t border-border">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.role} · {t.city}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const encodedText = encodeURIComponent(SHARE_TEXT + " " + SHARE_URL);
  const encodedUrl = encodeURIComponent(SHARE_URL);

  const shareLinks = [
    {
      label: "WhatsApp",
      Icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      label: "LinkedIn",
      Icon: Share2,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X",
      Icon: X,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodedUrl}`,
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div className="mt-12 text-center">
      <p className="text-sm font-semibold text-foreground mb-4">
        Share Addify with someone who needs it
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {shareLinks.map(({ label, Icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors duration-200"
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors duration-200"
        >
          {copied ? (
            <>
              <CheckCheck size={14} className="text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Link2 size={14} />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <Container>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Loved by Gulf professionals
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            Real stories, real clarity.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i} />
          ))}
        </div>

        <ShareButtons />
      </Container>
    </section>
  );
}
