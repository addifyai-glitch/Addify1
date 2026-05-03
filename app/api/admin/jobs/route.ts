import { NextRequest, NextResponse } from "next/server";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, company, city, country, currency,
    salary_min, salary_max, experience_level,
    apply_url, description, featured, expiry_days,
  } = body;

  if (!SUPABASE_OK) {
    console.log("[admin/jobs] Mock — would insert:", { title, company, city });
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

    const expiresAt = new Date(
      Date.now() + (Number(expiry_days ?? 30)) * 86400000
    ).toISOString();

    const { error } = await supabase.from("jobs").insert({
      title, company, city, country, currency,
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      experience_level, apply_url, description,
      is_featured: !!featured,
      approved: true,
      source: "admin",
      expires_at: expiresAt,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/jobs]", e);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
