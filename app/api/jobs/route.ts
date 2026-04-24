import { NextRequest, NextResponse } from "next/server";
import { MOCK_JOBS } from "@/data/mockJobs";
import type { Job } from "@/types/job";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "";
  const city = searchParams.get("city") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 12);

  // ── Try Supabase ──────────────────────────────────────────────────────────
  if (SUPABASE_OK) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        }
      );

      const now = new Date().toISOString();

      // Exact city match first
      let { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("approved", true)
        .gt("expires_at", now)
        .ilike("city", city || "%")
        .order("featured", { ascending: false })
        .order("posted_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // If no city matches, widen the search
      if (!data || data.length === 0) {
        ({ data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("approved", true)
          .gt("expires_at", now)
          .order("featured", { ascending: false })
          .order("posted_at", { ascending: false })
          .limit(limit));
        if (error) throw error;
      }

      return NextResponse.json({ jobs: data ?? [], source: "live" });
    } catch {
      // Fall through to mock
    }
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────
  const cityLower = city.toLowerCase();
  const titleLower = title.toLowerCase();

  let matched = MOCK_JOBS.filter(
    (j) =>
      j.city.toLowerCase() === cityLower ||
      j.title.toLowerCase().includes(titleLower.split(" ").slice(-1)[0] ?? "")
  );

  if (matched.length === 0) {
    matched = MOCK_JOBS;
  }

  // Sort: featured first, then most recent
  const sorted = [...matched].sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return NextResponse.json({
    jobs: sorted.slice(0, limit) as Job[],
    source: "mock",
  });
}
