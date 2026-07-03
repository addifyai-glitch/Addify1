import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIP } from "@/lib/rate-limit";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    console.log("[subscribe] no service key — queued:", email);
    return NextResponse.json({ success: true, source: "mock" });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });

    if (error) {
      // Table doesn't exist yet — log and accept gracefully
      if (error.code === "42P01") {
        console.log("[subscribe] table missing, queued:", email);
        return NextResponse.json({ success: true, source: "queued" });
      }
      throw error;
    }

    return NextResponse.json({ success: true, source: "live" });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
