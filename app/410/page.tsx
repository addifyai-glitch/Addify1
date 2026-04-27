import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Gone | Addify",
  description: "This resource has been permanently removed.",
  robots: { index: false, follow: false },
};

export default function GonePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center py-24">
        <Container className="max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">410 Gone</p>
          <h1 className="font-display text-4xl text-foreground mb-4">
            This page has been removed.
          </h1>
          <p className="text-muted-foreground mb-8">
            This resource no longer exists and will not be restored. If you were looking for a CV or resume file, it has been permanently deleted as part of a privacy cleanup.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
          >
            Go to Addify
          </Link>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
