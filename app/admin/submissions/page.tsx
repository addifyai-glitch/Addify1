import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Job } from "@/types/job";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SubmissionsPage() {
  const connected = isSupabaseConfigured();
  let pending: Job[] = [];
  let queryError: string | null = null;
  let totalJobs: number | null = null;
  let unapprovedCount: number | null = null;

  if (connected) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = createAdminClient();

      // Diagnostic: total row count (no filter)
      const { count: total } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });
      totalJobs = total ?? 0;

      // Diagnostic: unapproved count (no source filter)
      const { count: unapproved } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("approved", false);
      unapprovedCount = unapproved ?? 0;

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("approved", false)
        .eq("source", "user_submission")
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("[submissions] Supabase error:", error);
        queryError = error.message;
      } else {
        pending = data ?? [];
      }
    } catch (e) {
      console.error("[submissions] Unexpected error:", e);
      queryError = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground mb-2">Review Submissions</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {pending.length} pending
        {!connected && " (connect Supabase to see real submissions)"}
      </p>

      <div className="mb-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground font-mono">
        debug: total={totalJobs ?? "?"} | unapproved={unapprovedCount ?? "?"} | user_submissions={pending.length}
      </div>

      {queryError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive font-mono">
          Query error: {queryError}
        </div>
      )}

      {pending.length === 0 && !queryError ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">No pending submissions.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map((job) => (
            <div key={job.id} className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {job.company} · {job.city} · Submitted {formatDate(job.posted_at)}
                  </p>
                  {job.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  )}
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline mt-1 inline-block"
                  >
                    {job.apply_url}
                  </a>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-4 py-1.5 rounded-full bg-success/15 text-success text-xs font-semibold hover:bg-success/25 transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
