import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function hashIP(ip: string): string {
  return createHash("sha256").update(ip + "addify-salt").digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot — bots fill this field
  if (body.website) {
    return NextResponse.json({ success: true }); // silent reject
  }

  const {
    title, company, city, country, salary_min, salary_max, currency,
    experience_level, apply_url, description, submitter_email,
  } = body;

  // Basic validation
  if (!title || !company || !city || !apply_url || !submitter_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try { new URL(apply_url); } catch {
    return NextResponse.json({ error: "Invalid apply URL" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  if (!SUPABASE_OK) {
    console.log("[submit-job] Supabase not configured — mock success", { title, city });
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

    // Rate limit: max 3 submissions per IP hash per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("submitter_ip_hash", ipHash)
      .gt("created_at", oneHourAgo);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const { error } = await supabase.from("jobs").insert({
      title,
      company,
      city,
      country: country ?? city,
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      currency,
      experience_level,
      apply_url,
      description,
      submitter_email,
      submitter_ip_hash: ipHash,
      is_featured: false,
      approved: false,
      source: "user_submission",
    });

    if (error) throw error;
    return NextResponse.json({ success: true, source: "live" });
  } catch (e) {
    console.error("[submit-job]", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
