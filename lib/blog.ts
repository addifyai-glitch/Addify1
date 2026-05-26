import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  draft?: boolean;
  image?: string;
  imageAlt?: string;
};

export type Post = PostFrontmatter & {
  slug: string;
  content: string;
  source?: "file" | "db";
};

// ─── File-based posts (existing MDX files) ───────────────────────────────────

function getFilePosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      const { data, content } = matter(raw);
      return { slug, content, source: "file" as const, ...(data as PostFrontmatter) };
    });
}

function getFilePostBySlug(slug: string): Post | null {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { slug, content, source: "file", ...(data as PostFrontmatter) };
}

// ─── DB-based posts (Supabase blog_posts table) ───────────────────────────────

type DbRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  read_time: string;
  category: string;
  draft: boolean;
  image: string | null;
  image_alt: string | null;
  date: string;
};

function dbRowToPost(row: DbRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    author: row.author,
    readTime: row.read_time,
    category: row.category,
    draft: row.draft,
    image: row.image ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    date: row.date,
    source: "db",
  };
}

async function getDbPosts(): Promise<Post[]> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, description, content, author, read_time, category, draft, image, image_alt, date")
      .eq("draft", false)
      .order("date", { ascending: false });

    return (data ?? []).map((row) => dbRowToPost(row as DbRow));
  } catch {
    return [];
  }
}

async function getDbPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, description, content, author, read_time, category, draft, image, image_alt, date")
      .eq("slug", slug)
      .eq("draft", false)
      .single();

    if (!data) return null;
    return dbRowToPost(data as DbRow);
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const [filePosts, dbPosts] = await Promise.all([
    Promise.resolve(getFilePosts()),
    getDbPosts(),
  ]);

  const fileSlugSet = new Set(filePosts.map((p) => p.slug));
  const uniqueDbPosts = dbPosts.filter((p) => !fileSlugSet.has(p.slug));

  return [...filePosts, ...uniqueDbPosts]
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return getFilePostBySlug(slug) ?? getDbPostBySlug(slug);
}

export async function getRelatedPosts(slug: string, limit = 2): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.slug !== slug).slice(0, limit);
}

// Sync version used only for generateStaticParams (file posts only — DB posts handled via dynamic routing)
export function getFilePostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx|md)$/, ""));
}
