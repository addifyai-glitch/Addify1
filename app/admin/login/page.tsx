"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

const RESEND_COOLDOWN = 60; // seconds between sends

function isRateLimitError(msg: string) {
  return /rate limit|too many/i.test(msg);
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "unauthorized">("idle");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlError(params.get("error"));
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function sendOtp() {
    if (!email || cooldown > 0) return;
    setStatus("loading");
    setOtpError(null);

    // Step 1: Validate admin email server-side
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.unauthorized) { setStatus("unauthorized"); return; }

    // Step 2: Call Supabase from the browser so PKCE verifier is stored in browser cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) { setStatus("sent"); startCooldown(); return; }

    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        console.error("[admin-login] OTP error:", error.message, error.status);
        if (isRateLimitError(error.message)) {
          setOtpError("Too many login emails sent. Please wait an hour before trying again, or check your inbox for an earlier link.");
        } else {
          setOtpError(error.message);
        }
        setStatus("error");
        return;
      }

      setStatus("sent");
      startCooldown();
    } catch (err) {
      console.error("[admin-login] Unexpected error:", err);
      setStatus("error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Addify · Gulf Careers, Clarified.</p>
        </div>

        {urlError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
            Login failed ({urlError}). Request a new magic link below.
          </div>
        )}

        {status === "unauthorized" ? (
          <div className="text-center p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="font-semibold text-foreground">Unauthorized</p>
            <p className="text-sm text-muted-foreground mt-1">
              This email is not allowed to access the admin panel.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            {status !== "sent" ? (
              <form onSubmit={handleSubmit}>
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
                    {otpError ?? "Something went wrong. Check Supabase configuration."}
                  </p>
                )}
              </form>
            ) : (
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">Check your email</p>
                <p className="text-sm text-muted-foreground mb-5">
                  We sent a magic link to <strong>{email}</strong>. Click it to log in.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-center text-sm"
                  disabled={cooldown > 0}
                  onClick={sendOtp}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend magic link"}
                </Button>
                {otpError && (
                  <p className="mt-3 text-xs text-center text-destructive">{otpError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
