import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/admin";

  if (!code) {
    console.error("[auth/callback] No code parameter");
    return NextResponse.redirect(`${baseUrl}/admin/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange failed:", error.message);
    return NextResponse.redirect(`${baseUrl}/admin/login?error=exchange_failed`);
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}
