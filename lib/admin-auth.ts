import type { NextRequest } from "next/server";

// The one admin check for every /api/admin/* route.
// Fails closed: a missing setting or any error means "not an admin" (401),
// never a crash (500) and never access.
export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!url || !anonKey || !adminEmail) return false;

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(url, anonKey, {
      cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} },
    });
    const { data: { user } } = await supabase.auth.getUser();
    return !!user && user.email === adminEmail;
  } catch (e) {
    console.error("[admin-auth]", e);
    return false;
  }
}
