import { MOCK_JOBS } from "@/data/mockJobs";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Job } from "@/types/job";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SubmissionsPage() {
  const connected = isSupabaseConfigured();
  let pending: Job[] = [];

  if (connected) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("approved", false)
        .eq("source", "user_submission")
        .order("created_at", { ascending: false });
      pending = data ?? [];
    } catch {
      pending = [];
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground mb-2">Review Submissions</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {pending.length} pending
        {!connected && " (connect Supabase to see real submissions)"}
      </p>

      {!connected && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent">
          ⚠️ Supabase is not configured — real user submissions will appear here once connected.
        </div>
      )}

      {pending.length === 0 ? (
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
