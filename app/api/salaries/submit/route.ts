import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const SUPABASE_OK =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const rateMap = new Map<string, number[]>();

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const hash = createHash("sha256").update(ip + (process.env.RATE_LIMIT_SALT ?? "salt")).digest("hex");
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const hits = (rateMap.get(hash) ?? []).filter((t) => now - t < window);
  if (hits.length >= 3) return true;
  rateMap.set(hash, [...hits, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { website, title, country, city, experience, base_salary, housing_allowance, annual_bonus, nationality, company_size } = body;

  // Honeypot check
  if (website) {
    return NextResponse.json({ ok: true });
  }

  const ip = getIP(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

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

      const { error } = await supabase.from("salary_submissions").insert({
        title, country, city, experience,
        base_salary: Number(base_salary) || null,
        housing_allowance: Number(housing_allowance) || null,
        annual_bonus: Number(annual_bonus) || null,
        nationality: nationality || null,
        company_size: company_size || null,
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch {
      // Fall through to mock
    }
  }

  console.log("[salary-submit] Mock submission received:", { title, city, country, base_salary });
  return NextResponse.json({ ok: true });
}
