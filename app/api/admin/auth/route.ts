import { NextRequest, NextResponse } from "next/server";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return NextResponse.json({ unauthorized: true });
  }

  if (!SUPABASE_OK) {
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

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${req.headers.get("origin")}/auth/callback?next=/admin` },
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/auth]", e);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
