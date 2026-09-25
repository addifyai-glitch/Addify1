import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Tools that may collect a waitlist. Must match the check constraint in
// supabase/migrations/20260925_tool_waitlist.sql.
const KNOWN_TOOLS = new Set(["cover-letter"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A waitlist must never claim someone is signed up when nothing was stored.
// Every failure path below returns an error, including "not configured" and
// "table missing" (unlike /api/subscribe, which fakes success in those cases).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, tool, website } = body as Record<string, unknown>;

  // Honeypot: real users never fill the hidden "website" field.
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ success: true });
  }

  if (isRateLimited(getIP(req), 5)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in an hour." },
      { status: 429 }
    );
  }

  if (typeof tool !== "string" || !KNOWN_TOOLS.has(tool)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[waitlist] Supabase env not configured");
    return NextResponse.json(
      { error: "Sign-ups aren't working right now. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();

    const { error } = await supabase.from("tool_waitlist").insert({ email: cleanEmail, tool });

    if (error) {
      // 23505 = already on the list. That is a true "you're signed up".
      if (error.code === "23505") return NextResponse.json({ success: true });
      console.error("[waitlist] insert failed", error.code, error.message);
      return NextResponse.json(
        { error: "Sign-ups aren't working right now. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[waitlist]", e);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}
