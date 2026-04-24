import { NextRequest, NextResponse } from "next/server";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, subject, message } = body;

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
