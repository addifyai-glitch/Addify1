import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { FinalCTA } from "@/components/sections/final-cta";
import { Shield, MapPin, BadgeCheck, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Addify | Gulf Careers, Clarified.",
  description: "We built Addify to give Gulf professionals real salary data, honest job fit scores, and clear career advice. Learn who we are and why we built it.",
  alternates: { canonical: "/about" },
};

const differentiators = [
  {
    Icon: Shield,
    title: "Your data stays yours.",
    body: "We do not sell data to recruiters. We do not show your resume to anyone you did not apply to. Your salary submission is anonymous.",
  },
  {
    Icon: MapPin,
    title: "Local by design.",
    body: "Housing allowance, visa status, mainland versus free zone, Arabic support. We understand how Gulf hiring actually works, because we work here too.",
  },
  {
    Icon: BadgeCheck,
    title: "Backed by real data.",
    body: "Every salary range comes from public sources or real user submissions. Every source is labeled. When we do not have enough data, we say so.",
  },
  {
    Icon: Heart,
    title: "Free will stay free.",
    body: "Salary Check, Fit Score, and Cover Letter will always be free for job seekers. We will charge employers for advanced hiring tools. Never you.",
  },
];

const audiences = [
  {
    title: "Job seekers across the GCC",
    body: "Whether you are moving to Dubai from Cairo, switching industries in Riyadh, or applying for your first role in Doha, Addify helps you prepare. Know the market rate before you walk into the interview. Know if the job description matches your experience. Know what to change in your CV.",
  },
  {
    title: "Employers who need to hire better",
    body: "Small and medium businesses in the Gulf often pay too much or too little because they guess. Addify gives you market benchmarks for the role you are posting, screening questions generated for the actual job description, and a way to rank candidates by fit instead of by who applied first. Coming in the next phase.",
  },
];

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Addify",
  url: "https://addify.ae",
  logo: "https://addify.ae/logo.png",
  description: "Gulf career platform with real salary data, job fit scores, and career tools for professionals in UAE, Saudi Arabia, and the wider GCC.",
  areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"],
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">About Addify</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground max-w-3xl mx-auto leading-tight mb-6">
              Built in the Gulf, for people who work in the Gulf.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Addify helps you know what your work is worth, whether a job actually fits you, and how to move up. We started in the UAE, we serve the whole GCC, and we are bringing the same clarity to Europe next.
            </p>
          </Container>
        </section>

        {/* Why Addify exists */}
        <section className="py-16 md:py-20">
          <Container className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">Why Addify exists</h2>
            <div className="space-y-5 text-base text-muted-foreground leading-relaxed">
              <p>
                Salaries in the Gulf are hard to know. Ask five recruiters about the same role and you will get five different numbers. The official salary guides are usually old. Glassdoor barely covers the region. Bayt is closer but you have to dig. Most people end up guessing or asking friends in a WhatsApp group.
              </p>
              <p>
                So people accept offers that are too low. Or they ask for too much and lose the job. Or they take a role that looks good on paper and quit six months later because it was not a fit.
              </p>
              <p>
                We built Addify to fix that. You tell us your role and your city, and you get a real salary range built from real submissions. You upload your resume and paste a job, and you get a fit score with specific reasons. You do all of this for free, without signing up, without giving away your data, without a recruiter calling you the next day.
              </p>
            </div>
          </Container>
        </section>

        {/* Who we serve */}
        <section className="py-16 bg-muted/30">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-10 text-center">Who Addify is for</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {audiences.map((a) => (
                <div key={a.title} className="bg-card border border-border rounded-xl p-6 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-3">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* What makes us different */}
        <section className="py-16 md:py-20">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-10 text-center">What makes us different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {differentiators.map(({ Icon, title, body }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mt-0.5">
                      <Icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* What is coming */}
        <section className="py-16 bg-muted/30">
          <Container className="max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-5">What is coming</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              We are building Addify one tool at a time. Salary Check and Fit Score are live. The cover letter generator is next, then full employer tools, then Arabic support. After we have strong coverage across the GCC, we will bring the same approach to Europe, starting with London, Amsterdam, and Berlin. If there is a tool you want us to build, email us at{" "}
              <a href="mailto:hello@addify.ae" className="text-accent hover:underline">hello@addify.ae</a>.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              Get in touch
            </Link>
          </Container>
        </section>

        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
