import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";
import { WhyAddify } from "@/components/sections/why-addify";
import { Testimonials } from "@/components/sections/testimonials";
import { FinalCTA } from "@/components/sections/final-cta";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Addify",
  url: "https://addify.ae",
  logo: "https://addify.ae/logo.png",
  description: "Gulf career platform with real salary data and free career tools for professionals in UAE, Saudi Arabia, and the wider GCC.",
  areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"],
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
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
