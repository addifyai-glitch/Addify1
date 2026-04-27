import { NextRequest, NextResponse } from "next/server";
import { MOCK_JOBS } from "@/data/mockJobs";
import type { Job } from "@/types/job";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title    = searchParams.get("title") ?? "";
  const city     = searchParams.get("city") ?? "";
  const country  = searchParams.get("country") ?? "";
  const category = searchParams.get("category") ?? "";
  const experience = searchParams.get("experience") ?? "";
  const search   = searchParams.get("search") ?? "";
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
  const offset   = parseInt(searchParams.get("offset") ?? "0", 10);

  // ── Try Supabase ────────────────────────────────────────────────────────────
  if (SUPABASE_OK) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
      );

      const now = new Date().toISOString();
      let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("approved", true)
        .gt("expires_at", now);

      if (city) query = query.ilike("city", city);
      if (country) query = query.ilike("country", country);
      if (category) query = query.ilike("category", category);
      if (experience) query = query.ilike("experience_level", experience);
      if (search) query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
      if (title) query = query.ilike("title", `%${title}%`);

      query = query
        .order("featured", { ascending: false })
        .order("posted_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      // If the table is empty and no filters are active, fall through to mock
      const noFilters = !city && !country && !category && !experience && !search && !title;
      if ((count ?? 0) === 0 && noFilters) throw new Error("empty");
      return NextResponse.json({ jobs: data ?? [], total: count ?? 0, source: "live" });
    } catch {
      // Fall through to mock
    }
  }

  // ── Mock fallback ───────────────────────────────────────────────────────────
  let matched: Job[] = MOCK_JOBS;

  if (city) matched = matched.filter((j) => j.city.toLowerCase() === city.toLowerCase());
  if (country) matched = matched.filter((j) => j.country.toLowerCase() === country.toLowerCase());
  if (experience) matched = matched.filter((j) => j.experience_level?.toLowerCase() === experience.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    matched = matched.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
    );
  }
  if (title) {
    const q = title.toLowerCase();
    matched = matched.filter((j) => j.title.toLowerCase().includes(q));
  }

  // If no city/country/search match, return all (for live-jobs section)
  if ((city || country) && matched.length === 0) matched = MOCK_JOBS;

  const sorted = [...matched].sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return NextResponse.json({
    jobs: sorted.slice(offset, offset + limit) as Job[],
    total: sorted.length,
    source: "mock",
  });
}
