import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { revalidateJobPages } from "@/lib/revalidate-content";

export const runtime = "nodejs";

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

  const supabase = createAdminClient();
  // Read the slug first: if the edit changes it, the old address must be refreshed too.
  const { data: before } = await supabase.from("jobs").select("slug").eq("id", id).maybeSingle();
  const { data: after, error } = await supabase
    .from("jobs")
    .update({ ...body, modified_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("[admin/jobs/patch]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidateJobPages(before?.slug, after?.slug);
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
  const { data: removed, error } = await supabase.from("jobs").delete().eq("id", id).select("slug");

  if (error) {
    console.error("[admin/jobs/delete]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidateJobPages(...(removed ?? []).map((r) => r.slug as string));
  return NextResponse.json({ success: true });
}
