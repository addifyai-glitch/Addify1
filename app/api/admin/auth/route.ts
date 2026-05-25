import { NextRequest, NextResponse } from "next/server";

// Only validates the admin email — the OTP call happens client-side
// so Supabase's PKCE code verifier is stored in the browser automatically.
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) {
    return NextResponse.json({ unauthorized: true });
  }

  return NextResponse.json({ authorized: true });
}
