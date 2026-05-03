import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MOCK_JOBS } from "@/data/mockJobs";
import type { Job } from "@/types/job";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getMigrationJobs(): Job[] {
  try {
    const file = join(process.cwd(), "data", "migration-jobs.json");
    return JSON.parse(readFileSync(file, "utf8")) as Job[];
  } catch {
    return [];
  }
}

// Normalize mock data to ensure slug and is_filled are set
function normalizeMockJob(j: (typeof MOCK_JOBS)[number]): Job {
  return {
    ...j,
    is_filled: false,
    slug: j.slug ?? j.id,
    source: "admin" as const,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title      = searchParams.get("title") ?? "";
  const city       = searchParams.get("city") ?? "";
  const country    = searchParams.get("country") ?? "";
  const category   = searchParams.get("category") ?? "";
  const experience = searchParams.get("experience") ?? "";
  const search     = searchParams.get("search") ?? "";
  const limit      = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
  const offset     = parseInt(searchParams.get("offset") ?? "0", 10);

  // ── Try Supabase ────────────────────────────────────────────────────────────
  if (SUPABASE_OK) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("approved", true)
        .eq("is_filled", false);

      if (city)       query = query.ilike("city", city);
      if (country)    query = query.ilike("country", country);
      if (category)   query = query.ilike("category", category);
      if (experience) query = query.ilike("experience_level", experience);
      if (title)      query = query.ilike("title", `%${title}%`);
      if (search)     query = query.or(
        `title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`
      );

      query = query
        .order("is_featured", { ascending: false })
        .order("posted_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const noFilters = !city && !country && !category && !experience && !search && !title;
      if ((count ?? 0) === 0 && noFilters) throw new Error("empty");

      return NextResponse.json({ jobs: data ?? [], total: count ?? 0, source: "supabase" });
    } catch {
      // Fall through to JSON + mock fallback
    }
  }

  // ── JSON + mock fallback ────────────────────────────────────────────────────
  const migrationJobs = getMigrationJobs();
  const mockNormalized = MOCK_JOBS.map(normalizeMockJob);
  let matched: Job[] = [...migrationJobs, ...mockNormalized];

  if (city)       matched = matched.filter((j) => j.city.toLowerCase() === city.toLowerCase());
  if (country)    matched = matched.filter((j) => j.country.toLowerCase() === country.toLowerCase());
  if (category)   matched = matched.filter((j) => j.category?.toLowerCase() === category.toLowerCase());
  if (experience) matched = matched.filter((j) => j.experience_level?.toLowerCase() === experience.toLowerCase());
  if (title) {
    const q = title.toLowerCase();
    matched = matched.filter((j) => j.title.toLowerCase().includes(q));
  }
  if (search) {
    const q = search.toLowerCase();
    matched = matched.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.company ?? "").toLowerCase().includes(q) ||
        (j.description ?? "").toLowerCase().includes(q)
    );
  }

  const sorted = [...matched].sort((a, b) => {
    const af = a.is_featured ?? false;
    const bf = b.is_featured ?? false;
    if (af !== bf) return bf ? 1 : -1;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return NextResponse.json({
    jobs: sorted.slice(offset, offset + limit) as Job[],
    total: sorted.length,
    source: "json",
  });
}
