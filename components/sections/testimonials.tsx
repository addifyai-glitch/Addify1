"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, MessageCircle, Share2, X, Link2, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "@/data/testimonials";
import { Container } from "@/components/ui/container";

const SHARE_URL = "https://addify.ae";
const SHARE_TEXT = "Check what you should earn in the Gulf, free. Addify: Gulf Careers, Clarified.";

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < count ? "text-accent fill-accent" : "text-border fill-transparent"}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-6 flex flex-col gap-4 h-full">
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
    </div>
  );
}

function useVisibleCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setCount(1);
      else if (window.innerWidth < 1024) setCount(2);
      else setCount(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const encodedText = encodeURIComponent(SHARE_TEXT + " " + SHARE_URL);
  const encodedUrl = encodeURIComponent(SHARE_URL);

  const shareLinks = [
    { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${encodedText}` },
    { label: "LinkedIn", Icon: Share2, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "X", Icon: X, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodedUrl}` },
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
            <><CheckCheck size={14} className="text-success" /><span className="text-success">Copied!</span></>
          ) : (
            <><Link2 size={14} />Copy Link</>
          )}
        </button>
      </div>
    </div>
  );
}

export function Testimonials() {
  const visibleCount = useVisibleCount();
  const totalSlides = Math.ceil(TESTIMONIALS.length / visibleCount);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number, dir: number) => {
      setDirection(dir);
      setCurrentIndex((idx + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (document.activeElement !== sliderRef.current) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const visibleTestimonials = TESTIMONIALS.slice(
    currentIndex * visibleCount,
    currentIndex * visibleCount + visibleCount
  );

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 flex items-center justify-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            Loved by Gulf professionals
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            Real stories, real clarity.
          </h2>
        </motion.div>

        {/* Slider */}
        <div
          ref={sliderRef}
          tabIndex={0}
          className="relative focus:outline-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Testimonials slider"
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`grid gap-5 ${
                  visibleCount === 1
                    ? "grid-cols-1"
                    : visibleCount === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {visibleTestimonials.map((t) => (
                  <TestimonialCard key={t.id} t={t} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goPrev}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > currentIndex ? 1 : -1)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-6 bg-accent" : "w-1.5 bg-border"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <ShareButtons />
      </Container>
    </section>
  );
}
