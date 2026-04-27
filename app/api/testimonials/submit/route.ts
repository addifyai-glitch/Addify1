import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, city, quote, rating, permission, website, _formLoadedAt } = body;

    // Layer 1: honeypot
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Layer 2: rate limit — 5 per IP per hour
    if (isRateLimited(getIP(req), 5)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    // Layer 3: time-on-form
    if (_formLoadedAt && Date.now() - Number(_formLoadedAt) < 3000) {
      return NextResponse.json({ success: true }); // silent reject
    }

    if (!name || !role || !city || !quote || !permission) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (quote.length < 50 || quote.length > 500) {
      return NextResponse.json({ error: "Story must be 50 to 500 characters." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceKey);
      await supabase.from("testimonials").insert({
        name, role, city, quote, rating: rating ?? 5, approved: false,
      });
    } else {
      console.log("[testimonials/submit] mock submission:", { name, role, city, rating });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
