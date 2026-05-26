import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DbPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  draft: boolean;
  date: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminBlogPage() {
  const connected = isSupabaseConfigured();
  let posts: DbPost[] = [];
  let queryError: string | null = null;

  if (connected) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, category, draft, date, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        queryError = error.message;
      } else {
        posts = data ?? [];
      }
    } catch (e) {
      queryError = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} post{posts.length !== 1 ? "s" : ""} in database
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
        >
          + New Post
        </Link>
      </div>

      {queryError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive font-mono">
          Error: {queryError}
        </div>
      )}

      {!connected && (
        <div className="mb-6 p-4 bg-muted rounded-xl text-sm text-muted-foreground">
          Supabase not configured. Blog posts stored in the database will not appear here.
        </div>
      )}

      {posts.length === 0 && !queryError ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-2">No posts yet.</p>
          <Link href="/admin/blog/new" className="text-sm text-accent hover:underline">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {post.title}
                      <span className="block text-xs text-muted-foreground font-normal">/blog/{post.slug}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                      {post.category}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                      {formatDate(post.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        post.draft
                          ? "bg-muted text-muted-foreground"
                          : "bg-success/15 text-success"
                      }`}>
                        {post.draft ? "Draft" : "Published"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Edit
                        </Link>
                        {!post.draft && (
                          <>
                            <span className="text-border">|</span>
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="text-xs text-accent hover:underline"
                            >
                              View
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
