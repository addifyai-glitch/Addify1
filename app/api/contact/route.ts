import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIP } from "@/lib/rate-limit";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, subject, message, website, _formLoadedAt } = body;

  // Layer 1: honeypot
  if (website) {
    return NextResponse.json({ success: true });
  }

  // Layer 2: rate limit — 5 per IP per hour
  if (isRateLimited(getIP(req), 5)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Layer 3: time-on-form — reject if submitted in under 3 seconds
  if (_formLoadedAt && Date.now() - Number(_formLoadedAt) < 3000) {
    return NextResponse.json({ success: true }); // silent reject
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!SUPABASE_OK) {
    console.log("[contact] Supabase not configured — mock success", { name, email, subject });
    return NextResponse.json({ success: true, source: "mock" });
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { error } = await supabase.from("contact_messages").insert({
      name, email, subject, message,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, source: "live" });
  } catch (e) {
    console.error("[contact]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
