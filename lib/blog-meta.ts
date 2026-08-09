const MAX_LEN = 158;

function isJunkLine(line: string): boolean {
  const l = line.trim();
  if (!l) return true;
  if (l.startsWith("#")) return true;
  if (l.startsWith("![")) return true;
  if (l.startsWith(">")) return true;
  if (l.startsWith("|")) return true;
  if (l.startsWith("- ") || l.startsWith("* ")) return true;
  if (/^header image:/i.test(l)) return true;
  if (/header image[:\-]/i.test(l)) return true;
  if (/^\[.*\]\(.*\)$/.test(l)) return true;
  if (l.length < 40) return true;
  return false;
}

function stripMarkdown(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string): string {
  if (s.length <= MAX_LEN) return s;
  const cut = s.slice(0, MAX_LEN);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:]\s*$/, "") + "…";
}

export interface BlogPostMetaInput {
  title: string;
  body: string;
  seoDescription?: string | null;
}

export function deriveMetaDescription(post: BlogPostMetaInput): string {
  if (post.seoDescription && post.seoDescription.trim().length >= 40) {
    return truncate(stripMarkdown(post.seoDescription));
  }
  const lines = post.body.split(/\r?\n/);
  for (const line of lines) {
    if (isJunkLine(line)) continue;
    const clean = stripMarkdown(line);
    if (clean.length >= 40) return truncate(clean);
  }
  return truncate(`${cleanTitle(post.title)} – salary benchmarks and hiring insights from Addify.`);
}

export function cleanTitle(title: string): string {
  return title.replace(/\s*[:\-–—]\s*$/, "").trim();
}

export function buildBlogMetadata(
  post: BlogPostMetaInput & { slug: string; image?: string }
) {
  const title = cleanTitle(post.title);
  const description = deriveMetaDescription(post);
  const url = `https://addify.ae/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article" as const,
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: post.image ? [post.image] : undefined,
    },
  };
}
