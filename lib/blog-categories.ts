import { getAllPosts, type Post } from "@/lib/blog";
import { slugifyCategory } from "@/lib/slugify-category";

export { slugifyCategory };

export interface CategorySummary {
  category: string;
  slug: string;
  count: number;
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, slug: slugifyCategory(category), count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getPostsByCategorySlug(categorySlug: string): Promise<{ category: string; posts: Post[] } | null> {
  const posts = await getAllPosts();
  const matching = posts.filter((p) => slugifyCategory(p.category) === categorySlug);
  if (matching.length === 0) return null;
  return { category: matching[0].category, posts: matching };
}
