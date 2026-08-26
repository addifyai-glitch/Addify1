import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { buildRowWithFlags, isMissingFlaggedReasonsColumnError } from "@/lib/job-guard-db-helpers";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function hashIP(ip: string): string {
  return createHash("sha256").update(ip + "addify-salt").digest("hex").slice(0, 16);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot — bots fill this field
  if (body.website) {
    return NextResponse.json({ success: true }); // silent reject
  }

  const {
    title, company, city, country, category, employment_type,
    salary_min, salary_max, currency,
    experience_level, apply_url, description, submitter_email,
    captchaToken,
  } = body;

  const ALLOWED_WORK_TYPES = ["On-site", "Remote", "Hybrid"];
  const validEmploymentType = ALLOWED_WORK_TYPES.includes(employment_type) ? employment_type : "On-site";

  // Basic validation
  if (!title || !category || !apply_url || !submitter_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try { new URL(apply_url); } catch {
    return NextResponse.json({ error: "Invalid apply URL" }, { status: 400 });
  }
  if (!description || description.length < 200 || description.length > 2000) {
    return NextResponse.json(
      { error: "Description must be between 200 and 2000 characters" },
      { status: 400 }
    );
  }

  // reCAPTCHA verification
  const captcha = await verifyRecaptcha(captchaToken ?? "");
  if (!captcha.success) {
    return NextResponse.json(
      { error: "Spam check failed. Please refresh and try again." },
      { status: 403 }
    );
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

    // Generate a unique slug — append a base-36 timestamp to avoid collisions
    // without querying the DB (anon RLS can't see unapproved rows, so a DB
    // uniqueness check would always return "available" for pending submissions).
    const baseSlug = generateSlug(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const jobRow = {
      slug,
      title,
      company: company || null,
      city: city || null,
      country: country || "Remote",
      category,
      employment_type: validEmploymentType,
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      currency,
      experience_level: experience_level || "Entry",
      apply_url,
      description,
      submitter_email,
      submitter_ip_hash: ipHash,
      is_featured: false,
      approved: false,
      source: "user_submission",
    };

    // Ingest-time check, not a post-hoc audit. Warns and logs context only
    // — never blocks the submission or strips text. This job is already
    // unapproved (approved: false) pending manual admin review; flagged
    // matches are persisted to flagged_reasons so /admin/submissions can
    // show a warning banner instead of relying on someone reading server
    // logs.
    const { row, matches } = buildRowWithFlags(jobRow, "user_submission");

    let { error } = await supabase.from("jobs").insert(row);
    if (error && isMissingFlaggedReasonsColumnError(error) && matches.length > 0) {
      console.error(
        "[submit-job] flagged_reasons column not found — has supabase/migrations/20260826_add_jobs_flagged_reasons.sql been applied? Retrying insert without it."
      );
      ({ error } = await supabase.from("jobs").insert(jobRow));
    }

    if (error) throw error;
    return NextResponse.json({ success: true, source: "live" });
  } catch (e) {
    console.error("[submit-job]", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
