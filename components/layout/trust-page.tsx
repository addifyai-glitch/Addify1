import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export function TrustPage({
  eyebrow,
  title,
  intro,
  lastReviewed,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  lastReviewed: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl text-foreground mb-3 leading-tight">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground mb-3 max-w-2xl leading-relaxed">
            {intro}
          </p>
          <p className="text-sm text-muted-foreground mb-12">
            Last reviewed: {lastReviewed}
          </p>
          <div className="space-y-10 text-base text-muted-foreground leading-relaxed">
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
