import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { PostsGrid } from "@/components/blog/posts-grid";
import { getCategorySummaries, getPostsByCategorySlug } from "@/lib/blog-categories";

// Draft intro copy — one to two sentences per category. Wording is a first
// pass for editing, not final copy.
const CATEGORY_INTROS: Record<string, string> = {
  "CV and Applications":
    "Practical, Gulf-specific advice for building a CV and application that gets past the recruiter's first scan and into an interview.",
  "UAE Essentials":
    "The rules, allowances, and paperwork every professional working in the UAE should understand — from gratuity to visas to free zone versus mainland employment.",
  Kuwait:
    "Salary data and market context for professionals working in, or considering a move to, Kuwait.",
  "Living and Working":
    "What it actually costs to live and work in the Gulf's major cities, beyond the headline salary number.",
  Negotiation:
    "How to negotiate pay and terms with Gulf employers, from the first offer to the signed contract.",
  Qatar:
    "Salary benchmarks and market context for professionals working in, or considering a move to, Qatar.",
  "Career Growth":
    "Career moves, remote work, and long-term planning for professionals building a career in the Gulf.",
  "Saudi Arabia":
    "Salary data, Vision 2030 opportunities, and market context for professionals working in, or considering a move to, Saudi Arabia.",
};

function introFor(category: string): string {
  return CATEGORY_INTROS[category] ?? `Gulf careers articles in the ${category} category.`;
}

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const summaries = await getCategorySummaries();
  return summaries.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const result = await getPostsByCategorySlug(categorySlug);
  if (!result) return { title: "Category not found" };
  return {
    title: `${result.category} Articles`,
    description: introFor(result.category),
    alternates: { canonical: `/blog/category/${categorySlug}` },
  };
}

export default async function CategoryArchivePage({ params }: Props) {
  const { category: categorySlug } = await params;
  const result = await getPostsByCategorySlug(categorySlug);
  if (!result) notFound();
  const { category, posts } = result;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24">
          <MeshGradient variant="subtle" />
          <Container className="relative z-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Blog Category
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">{category}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">{introFor(category)}</p>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          <PostsGrid posts={posts} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
