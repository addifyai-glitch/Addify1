import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-display text-lg text-foreground">Addify</span>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/admin/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
            <Link href="/admin/submissions" className="hover:text-foreground transition-colors">Submissions</Link>
            <Link href="/" className="hover:text-foreground transition-colors">← Site</Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
