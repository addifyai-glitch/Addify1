import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIP } from "@/lib/rate-limit";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, website, _formLoadedAt } = body;

  if (website) return NextResponse.json({ success: true }); // honeypot

  if (isRateLimited(getIP(req), 3)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (_formLoadedAt && Date.now() - Number(_formLoadedAt) < 2000) {
    return NextResponse.json({ success: true }); // bot timing guard
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  if (!SUPABASE_OK) {
    console.log("[subscribe] Supabase not configured — mock success", { email });
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

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });

    if (error) throw error;
    return NextResponse.json({ success: true, source: "live" });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
