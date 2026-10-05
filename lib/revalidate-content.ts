import { revalidatePath } from "next/cache";

// Public job and blog pages are cached by Next.js: job pages are rebuilt at
// most once an hour (`revalidate = 3600`), blog post and category pages are
// built once and kept. Every admin write that changes what the public should
// see must call the matching function below, otherwise the change stays
// invisible until the next rebuild or deploy.
//
// A failed cache refresh must never fail the write itself, so errors are
// logged and swallowed.

export function revalidateJobPages(...slugs: Array<string | null | undefined>): void {
  try {
    revalidatePath("/jobs");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/jobs/${slug}`);
    }
    revalidatePath("/sitemap.xml");
  } catch (e) {
    console.error("[revalidate] jobs", e);
  }
}

export function revalidateBlogPages(...slugs: Array<string | null | undefined>): void {
  try {
    revalidatePath("/blog");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/blog/${slug}`);
    }
    // A post can move between categories, so refresh every category archive.
    revalidatePath("/blog/category/[category]", "page");
    revalidatePath("/sitemap.xml");
  } catch (e) {
    console.error("[revalidate] blog", e);
  }
}
