import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ui/ad-slot";
import { ButtonLink } from "@/components/blog/button-link";
import { getFilePostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { buildBlogMetadata } from "@/lib/blog-meta";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  return getFilePostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildBlogMetadata({
    slug,
    title: post.title,
    body: post.content,
    seoDescription: post.description,
    image: post.image,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, 2);
  const shareUrl = `https://addify.ae/blog/${slug}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${post.title} via Addify`);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <Container className="max-w-3xl">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          {/* Article header */}
          <Badge variant="accent" className="mb-4">{post.category}</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <hr className="border-border mb-8" />

          {/* Hero image */}
          {post.image && (
            <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl mb-8">
              <Image
                src={post.image}
                alt={post.imageAlt ?? post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}

          {/* In-content ad */}
          <AdSlot format="in-article" className="mb-8" />

          {/* Article body */}
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
            <MDXRemote source={post.content} components={{ ButtonLink }} />
          </article>

          {/* Footer ad */}
          <AdSlot format="multiplex" className="mt-12 mb-8" />

          {/* Social share */}
          <div className="border-t border-border pt-8 mt-8">
            <p className="text-sm font-semibold text-foreground mb-4">Share this article</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                X (Twitter)
              </a>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-foreground mb-5">Related articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-hover hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300">
                      <Badge variant="default" className="mb-2 text-xs">{p.category}</Badge>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{p.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
