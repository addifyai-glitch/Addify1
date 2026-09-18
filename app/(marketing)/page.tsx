import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";
import { WhyAddify } from "@/components/sections/why-addify";
import { Testimonials } from "@/components/sections/testimonials";
import { FinalCTA } from "@/components/sections/final-cta";

// Title/description/OG/Twitter are the root layout's own defaults — they
// were written as the homepage's copy in the first place. Only the
// canonical was missing.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Organization schema now lives sitewide in app/layout.tsx, not per-page.
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Stats />
        <WhyAddify />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
