import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { getAllPosts } from "@/lib/blog";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { PostsGrid } from "@/components/blog/posts-grid";

export const metadata: Metadata = {
  title: "Blog | Addify. Gulf Careers, Clarified.",
  description:
    "Salary guides, job market insights, and career advice for professionals across the UAE, Saudi Arabia, Qatar, and the wider Gulf.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Insights
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              The Addify Guide to Gulf Careers
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Salary benchmarks, negotiation tactics, and job market intelligence
              for professionals across the Gulf.
            </p>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          {posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
              <p className="text-sm text-muted-foreground">
                Check back soon. Content is on the way.
              </p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
                  <div className="bg-card border border-border rounded-2xl shadow-soft hover:shadow-hover hover:-translate-y-0.5 hover:border-accent/40 transition-all duration-300 overflow-hidden">
                    {featured.image && (
                      <div className="relative aspect-[21/8] w-full overflow-hidden">
                        <Image
                          src={featured.image}
                          alt={featured.imageAlt ?? featured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 1200px"
                          priority
                        />
                      </div>
                    )}
                    <div className="p-8 md:p-10">
                      <Badge variant="accent" className="mb-4">
                        {featured.category}
                      </Badge>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3 group-hover:text-accent transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed mb-5 max-w-2xl">
                        {featured.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{featured.author}</span>
                        <span>·</span>
                        <span>{formatDate(featured.date)}</span>
                        <span>·</span>
                        <span>{featured.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Filterable grid */}
              {rest.length > 0 && <PostsGrid posts={rest} />}
            </>
          )}

          {/* Newsletter */}
          <div className="mt-16 bg-muted/40 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-display text-xl text-foreground mb-2">Stay updated</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Gulf salary insights and career guides, straight to your inbox. No spam.
            </p>
            <NewsletterForm />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
