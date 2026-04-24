"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MeshGradient } from "@/components/ui/mesh-gradient";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <MeshGradient variant="subtle" />

      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4">
            Ready to know your worth?
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground max-w-xl mx-auto leading-tight">
            Check your first salary in 60 seconds. Free.
          </h2>

          <div className="mt-10">
            <Button asChild size="lg" variant="primary">
              <Link href="/salary">Get Started</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            No signup required &nbsp;·&nbsp; No credit card ever
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
