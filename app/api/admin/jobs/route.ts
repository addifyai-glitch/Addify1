import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title, company, city, country, currency, category,
      employment_type, salary_min, salary_max, experience_level,
      apply_url, description, featured, expiry_days,
    } = body;

    if (!title || !city || !apply_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expiresAt = new Date(
      Date.now() + (Number(expiry_days ?? 30)) * 86400000
    ).toISOString();

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;

    const supabase = createAdminClient();
    const { error } = await supabase.from("jobs").insert({
      slug,
      title, company, city, country, currency,
      category: category || null,
      employment_type: employment_type || "On-site",
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      experience_level: experience_level || "Entry",
      apply_url, description,
      is_featured: !!featured,
      approved: true,
      source: "admin",
      expires_at: expiresAt,
    });

    if (error) {
      console.error("[admin/jobs] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    console.error("[admin/jobs]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
