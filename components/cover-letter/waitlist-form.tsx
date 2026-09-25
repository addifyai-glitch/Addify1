"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({ tool }: { tool: "cover-letter" }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, real users leave it empty
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tool, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-base font-semibold text-foreground">You&apos;re on the list.</p>
        <p className="text-sm text-foreground/80 mt-1">
          We&apos;ll email you once, when the cover letter writer goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h2 className="text-lg font-semibold text-foreground">Get notified when this goes live.</h2>
      <p className="text-sm text-foreground/80 mt-1 mb-4">
        One email when it launches. Nothing else.
      </p>

      <label htmlFor="waitlist-email" className="text-xs font-medium text-foreground mb-2 block">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-describedby={status === "error" ? "waitlist-error" : undefined}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Joining..." : "Notify me"}
        </button>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <p id="waitlist-error" role="alert" className="text-sm text-destructive mt-3 min-h-[1.25rem]">
        {status === "error" ? message : ""}
      </p>
    </form>
  );
}
