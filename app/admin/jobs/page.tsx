import Link from "next/link";
import { MOCK_JOBS } from "@/data/mockJobs";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Job } from "@/types/job";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminJobsPage() {
  const connected = isSupabaseConfigured();
  let jobs: Job[] = [];

  if (connected) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("approved", true)
        .order("posted_at", { ascending: false });
      jobs = data ?? [];
    } catch {
      jobs = MOCK_JOBS;
    }
  } else {
    jobs = MOCK_JOBS;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Manage Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length} published listing{jobs.length !== 1 ? "s" : ""}
            {!connected && " (mock data)"}
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
        >
          + Post New Job
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide border-b border-border">
                <th className="text-left px-5 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">City</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Posted</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Expires</th>
                <th className="text-left px-4 py-3 font-semibold">Featured</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {job.title}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                    {job.company}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell">
                    {job.city}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                    {formatDate(job.posted_at)}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell">
                    {formatDate(job.expires_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      job.featured
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {job.featured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/jobs/${job.id}/edit`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <span className="text-border">|</span>
                      <button className="text-xs text-destructive hover:opacity-70 transition-opacity">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
