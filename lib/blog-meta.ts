const MAX_LEN = 155;
// Root layout's title template appends " | Addify" (9 chars) to every page
// title, so a raw title has to stay under 51 chars to keep the rendered
// <title> under the ~60-char SERP limit.
const MAX_TITLE_LEN = 51;

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

function truncate(s: string, maxLen: number = MAX_LEN, minCut: number = 80): string {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > minCut ? cut.slice(0, lastSpace) : cut).replace(/[.,;:]\s*$/, "") + "…";
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

function truncateTitle(title: string): string {
  // minCut lower than the description's: titles are short enough that a
  // stricter last-space search still finds a sensible break point.
  return truncate(title, MAX_TITLE_LEN, 25);
}

export function buildBlogMetadata(
  post: BlogPostMetaInput & { slug: string; image?: string }
) {
  const title = truncateTitle(cleanTitle(post.title));
  const description = deriveMetaDescription(post);
  const url = `https://addify.ae/blog/${post.slug}`;
  const ogImageUrl = post.image ?? `/api/og/default?title=${encodeURIComponent(title)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article" as const,
      siteName: "Addify.ae",
      locale: "en_AE",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
