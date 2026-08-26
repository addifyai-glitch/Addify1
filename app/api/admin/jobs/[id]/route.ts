import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { buildRowWithFlags, isMissingFlaggedReasonsColumnError } from "@/lib/job-guard-db-helpers";

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

// GET /api/admin/jobs/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/admin/jobs/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Ingest-time check, not a post-hoc audit — covers edits, not just
  // initial creation. Warns and logs context only; flagged matches are
  // persisted to flagged_reasons (overwriting any previous value — an
  // edit that fixes flagged content should clear the banner, and one that
  // introduces new flagged content should show it).
  const { matches } = buildRowWithFlags(body, "admin-edit");
  const update: Record<string, unknown> = {
    ...body,
    modified_at: new Date().toISOString(),
    flagged_reasons: matches.length > 0 ? matches : null,
  };

  const supabase = createAdminClient();
  let { error } = await supabase.from("jobs").update(update).eq("id", id);
  if (error && isMissingFlaggedReasonsColumnError(error)) {
    console.error(
      "[admin/jobs/patch] flagged_reasons column not found — has supabase/migrations/20260826_add_jobs_flagged_reasons.sql been applied? Retrying update without it."
    );
    const { flagged_reasons: _drop, ...fallbackUpdate } = update;
    ({ error } = await supabase.from("jobs").update(fallbackUpdate).eq("id", id));
  }

  if (error) {
    console.error("[admin/jobs/patch]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/jobs/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    console.error("[admin/jobs/delete]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
