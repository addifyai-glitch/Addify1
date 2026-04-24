import Link from "next/link";
import { Briefcase, Inbox, BarChart3 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const cards = [
  {
    href: "/admin/jobs",
    Icon: Briefcase,
    title: "Manage Jobs",
    description: "View, edit, feature, and delete all published job listings.",
  },
  {
    href: "/admin/submissions",
    Icon: Inbox,
    title: "Review Submissions",
    description: "Approve or reject user-submitted jobs pending review.",
  },
  {
    href: "/admin/salaries",
    Icon: BarChart3,
    title: "Salary Submissions",
    description: "View anonymous salary data contributed by users.",
  },
];

export default function AdminDashboard() {
  const connected = isSupabaseConfigured();

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Welcome to the Addify admin panel.
      </p>

      {!connected && (
        <div className="mb-8 p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent">
          ⚠️ Supabase is not configured. All data shown is mock. Set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
          <code className="font-mono text-xs">.env.local</code> to enable real functionality.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map(({ href, Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Icon size={20} />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
