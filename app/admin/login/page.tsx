"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const SUPABASE_OK =
  typeof window !== "undefined"
    ? !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : false;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "unauthorized">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (data.unauthorized) setStatus("unauthorized");
    else if (data.success) setStatus("sent");
    else setStatus("error");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Addify · Gulf Careers, Clarified.</p>
        </div>

        {!SUPABASE_OK && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent">
            ⚠️ Connect Supabase to enable real admin functionality (see{" "}
            <code className="font-mono text-xs">.env.example</code>).
          </div>
        )}

        {status === "sent" ? (
          <div className="text-center p-6 bg-success/10 border border-success/30 rounded-xl">
            <p className="font-semibold text-foreground mb-1">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>. Click it to log in.
            </p>
          </div>
        ) : status === "unauthorized" ? (
          <div className="text-center p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="font-semibold text-foreground">Unauthorized</p>
            <p className="text-sm text-muted-foreground mt-1">
              This email is not allowed to access the admin panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@addify.ae"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 mb-5"
            />
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Send magic link"}
            </Button>
            {status === "error" && (
              <p className="mt-3 text-sm text-center text-destructive">
                Something went wrong. Check Supabase configuration.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
