"use client";

import { useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const loadedAt = useRef(Date.now().toString());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const website = (form.elements.namedItem("website") as HTMLInputElement).value;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, _formLoadedAt: loadedAt.current }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Something went wrong. Try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-3">
        <p className="text-sm font-semibold text-foreground">You are in.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Gulf salary updates and career insights coming your way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        defaultValue=""
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />

      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        disabled={status === "loading"}
        className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>

      {status === "error" && (
        <p className="w-full text-xs text-red-500 -mt-1">{errorMsg}</p>
      )}
    </form>
  );
}
