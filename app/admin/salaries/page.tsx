import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function SalariesPage() {
  const connected = isSupabaseConfigured();

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground mb-2">Salary Submissions</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Anonymous salary data contributed by users
        {!connected && " (connect Supabase to view real data)"}
      </p>

      {!connected && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent">
          ⚠️ Supabase is not configured — salary submissions will appear here once connected.
        </div>
      )}

      <div className="text-center py-16 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">
          Salary submission feature coming soon.
        </p>
      </div>
    </div>
  );
}
